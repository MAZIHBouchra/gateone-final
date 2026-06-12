import re
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from xgboost import XGBRegressor


# CONSTANTES

NUMERIC_FEATURES = [
    # Surface
    "surface_num", "log_surface", "log_surface_sq", "log_surface_cb",
    "palier_surface", "surface_relative", "residuel_surface",
    # Zone stats (calculées sur train)
    "te_log_pm2_zone", "te_log_pm2_std",
    "prix_m2_moy_quartier", "prix_median_quartier", "nb_listings_quartier",
    "ratio_pm2_city",
    "surface_x_quartier", "surface_log_x_pm2",
    "prix_estime", "log_prix_estime",
    # Interactions clés
    "surface_x_te", "usage_x_te",
    "usage_score",       
    "r_plus_num",        
    "is_titre_foncier",
    "is_melkiya",
    "is_plat",
    "is_angle",
    "is_viabilise",
    "has_eau",
    "is_negociable",
    # NLP keywords
    "kw_immeuble", "kw_agricole", "kw_villa_zone", "kw_tf", "kw_melk",
    "kw_facade", "kw_projet", "kw_urgent", "kw_resid",
    "terrain_quality",
    # Distance
    "km_distance", "km_x_log_surface",
    # Zone bias
    "zone_bias",
    # Misc
    "nb_photos_clean",
]

BINARY_FEATURES = [
    "piscine", "parking", "jardin", "securite", "vue",
    "terrasse", "neuf", "meuble", "climatisation", "hammam", "cave", "ascenseur",
    "is_particulier",
    "is_industriel", "is_lotissement", "is_agricole", "is_zone_villa",
    "is_constructible", "is_hectare", "is_r2_r3", "is_residentiel",
    "is_golf",
]

CATEGORICAL_FEATURES = [
    "zone_clean",
    "source_clean",
    "usage_cat",       
    "statut_titre",    
    "surface_cat",
]

TARGET_RAW   = "prix_num"
TARGET_LOG   = "log_pm2"   

SURFACE_MIN  = 50
SURFACE_MAX  = 500_000
PRIX_M2_MIN  = 50
PRIX_M2_MAX  = 25_000   
EUR_TO_MAD   = 10.8

# Zone map : (nom, pattern regex)
ZONE_MAP = [
    ('Semlalia',     r'semlalia'),    ('Maarif',       r'ma.?rif'),
    ('Gauthier',     r'gauthier'),    ('Hay_Chrifa',   r'hay chrifa'),
    ('Sidi_Maarouf', r'sidi maarouf'),('Golf_Argana',  r'golf argana|argana golf|argana'),
    ('Ain_Borja',    r'ain borja'),   ('Al_Wifaq',     r'al wifaq'),
    ('Bab_Doukkala', r'bab doukkala'),('Mhamid',       r'mhamid'),
    ('Sidi_Ghanem',  r'sidi ghanem'), ('Annakhil',     r'annakhil'),
    ('Masmoudi',     r'masmoudi'),    ('Hay_Bahja',    r'hay al bahja|bahja'),
    ('Ouahat_SB',    r'ouahat'),      ('Alouidane',    r'alouidane'),
    ('Tassoultante', r'tassoultante'),('Saada',        r'saada'),
    ('Prestigia',    r'prestig'),     ('Amelkis',      r'amelkis'),
    ('Menara',       r'm.?nara'),     ('Aeroport',     r'a.?roport'),
    ('Tahanaout',    r'tahanaout'),   ('Palmeraie',    r'palmeraie'),
    ('Targa',        r'targa'),       ('Agdal',        r'agdal'),
    ('Gueliz',       r'gu.?liz'),     ('Medina',       r'm.?dina'),
    ('Hivernage',    r'hivernage'),   ('Daoudiate',    r'daoudiate'),
    ('Route_Ourika', r'ourika'),      ('Route_Fes',    r'f.?s'),
    ('Route_Casa',   r'casablanca'),  ('Route_Amizmiz',r'amizmiz|amezmiz'),
    ('Route_Safi',   r'safi'),        ('Iziki',        r'iziki'),
]


# HELPERS

def extract_zone(row):
    q = str(row.get('quartier', '') or '').strip()
    if q and q not in ('', 'nan', 'Autre'):
        return q
    text = ' '.join([str(row.get(c, '') or '') for c in ['titre', 'localisation', 'description']]).lower()
    for name, pat in ZONE_MAP:
        if re.search(pat, text):
            return name
    return 'Autre'


def kw_flag(df, col, pattern, regex=True):
    if col not in df.columns:
        return pd.Series(0, index=df.index)
    return df[col].str.lower().str.contains(pattern, na=False, regex=regex).astype(int)


def extract_km(text):
    if pd.isna(text): return 0
    m = re.search(r'km\s*(\d+)', str(text).lower())
    return int(m.group(1)) if m else 0


# 1. CHARGEMENT & CLEANING

def load_data(path: str):
    """Charge, nettoie et enrichit le CSV terrain. Retourne (df, X, y)."""
    df = pd.read_csv(path)

    # Filtre type de bien
    terrain_types = ["Terrain", "Vente Terrain", "terrain"]  # Maison exclue : pm2 bati contamine
    if "type_bien" in df.columns:
        before = len(df)
        df = df[df["type_bien"].isin(terrain_types)].copy()
        print(f"  Filtre terrain : {len(df)} / {before} lignes")

    # EUR → MAD
    if "prix" in df.columns:
        eur_mask = df["prix"].str.contains("EUR", na=False)
        df.loc[eur_mask, "prix_num"] = df.loc[eur_mask, "prix_num"] * EUR_TO_MAD

    df = df[df["prix_num"].notna() & (df["prix_num"] > 0)].copy()
    df = df[df["surface_num"].notna() & (df["surface_num"] >= SURFACE_MIN) & (df["surface_num"] <= SURFACE_MAX)].copy()

    df["_pm2"] = df["prix_num"] / df["surface_num"]
    df = df[(df["_pm2"] >= PRIX_M2_MIN) & (df["_pm2"] <= PRIX_M2_MAX)].copy()
    df.drop(columns=["_pm2"], inplace=True)

    # v4 — déduplication
    if "localisation" in df.columns:
        df = df.drop_duplicates(subset=["prix_num", "surface_num", "localisation"]).copy()

    log_p = np.log(df["prix_num"])
    df = df[(log_p >= log_p.quantile(0.01)) & (log_p <= log_p.quantile(0.99))].copy()
    df.reset_index(drop=True, inplace=True)

    df["etage"] = 0; df["etage_known"] = 0
    df["chambres_num"] = 0; df["salles_bain_num"] = 0

    # Source / agence
    if "source" in df.columns:
        top_src = df["source"].value_counts().index[:5].tolist()
        df["source_clean"] = df["source"].apply(lambda x: x if x in top_src else "autre_src")
    else:
        df["source_clean"] = "inconnu"

    if "agence" in df.columns:
        df["is_particulier"] = df["agence"].str.lower().str.contains("particulier", na=False).astype(int)
    elif "type_vendeur" in df.columns:
        df["is_particulier"] = (df["type_vendeur"] == "particulier").astype(int)
    else:
        df["is_particulier"] = 0

    df["_text_all"] = (
        df["description"].fillna("") + " " +
        df["titre"].fillna("") + " " +
        (df["localisation"].fillna("") if "localisation" in df.columns else "")
    ).str.lower()

    #  Antigravity features v5 ─
    USAGE_SCORE_MAP = {
        "agricole":-3,"industriel":-1,"villa":0,"non_precise":0,
        "lotissement":2,"immeuble_r1":1,"immeuble_r2":2,"immeuble_r3":3,"immeuble_r4_plus":4,
    }
    # usage_score ordinal
    if "usage" in df.columns and df["usage"].notna().sum() > len(df) * 0.1:
        df["usage_score"] = df["usage"].fillna("non_precise").map(USAGE_SCORE_MAP).fillna(0)
        df["usage_cat"]   = df["usage"].fillna("non_precise").apply(
            lambda u: "immeuble" if "immeuble" in str(u) or str(u)=="lotissement"
                      else str(u) if str(u) in ("villa","agricole","industriel") else "non_precise"
        )
    else:
        df["usage_score"] = 0.0
        df["usage_cat"]   = "non_precise"

    # titre_juridique → statut_titre + flags
    if "titre_juridique" in df.columns and df["titre_juridique"].notna().sum() > len(df) * 0.1:
        df["is_titre_foncier"] = (df["titre_juridique"] == "titre_foncier").astype(int)
        df["is_melkiya"]       = (df["titre_juridique"] == "melkiya").astype(int)
        df["statut_titre"]     = df["titre_juridique"].fillna("non_specifie")
    else:
        df["is_titre_foncier"] = df["_text_all"].str.contains(r"titré|titre.foncier|\btf\b", regex=True, na=False).astype(int)
        df["is_melkiya"]       = df["_text_all"].str.contains(r"melk|moulkia", regex=True, na=False).astype(int)
        df["statut_titre"]     = "non_specifie"
        df.loc[df["is_titre_foncier"]==1,"statut_titre"] = "titre_foncier"
        df.loc[df["is_melkiya"]==1,"statut_titre"]       = "melkiya"

    # topographie → is_plat
    if "topographie" in df.columns and df["topographie"].notna().sum() > len(df) * 0.1:
        df["is_plat"]  = (df["topographie"] == "plat").astype(int)
        df["is_angle"] = (df["forme"].fillna("") == "angle").astype(int) if "forme" in df.columns else df["_text_all"].str.contains(r"\bangle\b", regex=True, na=False).astype(int)
    else:
        df["is_plat"]  = df["_text_all"].str.contains(r"terrain.plat|\bplat\b", regex=True, na=False).astype(int)
        df["is_angle"] = df["_text_all"].str.contains(r"\bangle\b|deux.façades", regex=True, na=False).astype(int)

    # viabilisation
    if "viabilise" in df.columns and df["viabilise"].notna().sum() > 0:
        df["is_viabilise"] = df["viabilise"].map({True:1,False:0}).fillna(0).astype(int)
    else:
        df["is_viabilise"] = df["_text_all"].str.contains(r"viabili|raccordé", regex=True, na=False).astype(int)

    if "eau" in df.columns and df["eau"].notna().sum() > 0:
        df["has_eau"] = df["eau"].map({True:1,False:0}).fillna(0).astype(int)
    else:
        df["has_eau"] = df["_text_all"].str.contains(r"\beau\b|réseau.eau", regex=True, na=False).astype(int)

    # negociable
    if "negociable" in df.columns and df["negociable"].notna().sum() > 0:
        df["is_negociable"] = df["negociable"].map({True:1,False:0}).fillna(0).astype(int)
    else:
        df["is_negociable"] = 0

    # r_plus
    if "r_plus" in df.columns and df["r_plus"].notna().sum() > 0:
        R_PLUS_MAP = {"R+1":1,"R+2":2,"R+3":3,"R+4":4,"R+5":5}
        df["r_plus_num"] = df["r_plus"].map(R_PLUS_MAP).fillna(0)
    else:
        rp = df["_text_all"].str.extract(r"r\+([0-9])")[0]
        df["r_plus_num"] = pd.to_numeric(rp, errors="coerce").fillna(0)

    # nb_photos
    if "nb_photos" in df.columns:
        df["nb_photos_clean"] = pd.to_numeric(df["nb_photos"], errors="coerce").fillna(0).clip(upper=50)
    else:
        df["nb_photos_clean"] = 0

    df["kw_agricole"] = df["_text_all"].str.contains(r"agricole|agri\b|oliveraie|palmier|verger|hectare", regex=True, na=False).astype(int)

    # Zone extraction élargie
    df["zone_clean"] = df.apply(extract_zone, axis=1)

    # NLP Keywords (v3)
    df["is_industriel"]   = kw_flag(df,"titre","industriel",False) | kw_flag(df,"description","industriel",False)
    df["is_lotissement"]  = kw_flag(df,"titre","lotissement",False)| kw_flag(df,"description","lotissement",False)
    df["is_agricole"]     = kw_flag(df,"titre","agricole",False)   | kw_flag(df,"description","agricole",False)
    df["is_zone_villa"]   = kw_flag(df,"titre","zone villa",False) | kw_flag(df,"description","zone villa",False)
    df["is_constructible"]= kw_flag(df,"description","constructible",False)
    df["is_hectare"]      = kw_flag(df,"description",r"hectare|ha\b") | kw_flag(df,"titre",r"hectare|ha\b")
    df["is_r2_r3"]        = kw_flag(df,"description",r"r\+[23456]") | kw_flag(df,"titre",r"r\+[23456]")
    df["is_residentiel"]  = kw_flag(df,"description",r"r.?sidentiel")
    df["is_golf"]         = kw_flag(df,"description","golf",False) | kw_flag(df,"titre","golf",False)
    df["is_viabilise"]    = kw_flag(df,"description",r"viabili")   | kw_flag(df,"titre",r"viabili")

    # NLP Keywords v4 — nouveaux signaux forts
    df["kw_immeuble"]  = df["_text_all"].str.contains(r"immeuble|r\+[0-9]|rez.de", regex=True, na=False).astype(int)
    df["kw_agricole"]  = df["_text_all"].str.contains(r"agricole|agri\b|oliveraie|palmier|verger", regex=True, na=False).astype(int)
    df["kw_villa_zone"]= df["_text_all"].str.contains(r"zone villa|lotissement villa", regex=True, na=False).astype(int)
    df["kw_resid"]     = df["_text_all"].str.contains(r"résidentiel|zone résid", regex=True, na=False).astype(int)
    df["kw_facade"]    = df["_text_all"].str.contains(r"façade|front de", regex=True, na=False).astype(int)
    df["kw_projet"]    = df["_text_all"].str.contains(r"projet|promotion|programme", regex=True, na=False).astype(int)
    df["kw_plat"]      = df["_text_all"].str.contains(r"terrain plat|nivelé|plat\b", regex=True, na=False).astype(int)
    df["kw_urgent"]    = df["_text_all"].str.contains(r"urgent|à saisir|négociable", regex=True, na=False).astype(int)
    df["kw_tf"]        = df["_text_all"].str.contains(r"titré|titre foncier|\btf\b", regex=True, na=False).astype(int)
    df["kw_melk"]      = df["_text_all"].str.contains(r"melk|melkia", regex=True, na=False).astype(int)

    df["terrain_quality"] = (
        df["kw_immeuble"]    * 4 +
        df["kw_facade"]      * 3 +
        df["is_golf"]        * 3 +
        df["kw_villa_zone"]  * 2 +
        df["is_constructible"] * 2 +
        df["is_viabilise"]   * 2 +
        df["kw_plat"]        * 1 +
        df["kw_tf"]          * 1 -
        df["kw_agricole"]    * 3 -
        df["is_industriel"]  * 1
    )

    # Usage terrain (catégorielle v4)
    df["usage_terrain"] = "autre"
    df.loc[df["kw_immeuble"]   == 1, "usage_terrain"] = "immeuble"
    df.loc[df["kw_agricole"]   == 1, "usage_terrain"] = "agricole"
    df.loc[df["is_golf"]       == 1, "usage_terrain"] = "golf"
    df.loc[df["is_industriel"] == 1, "usage_terrain"] = "industriel"

    # Statut titre (catégorielle v4)
    df["statut_titre"] = "non_specifie"
    df.loc[df["kw_tf"]   == 1, "statut_titre"] = "titre_foncier"
    df.loc[(df["kw_melk"] == 1) & (df["kw_tf"] == 0), "statut_titre"] = "melkiya"

    # Tranche surface (catégorielle v4)
    df["surface_cat"] = pd.cut(
        df["surface_num"],
        bins=[0, 300, 1000, 5000, 20000, 100000, 999999],
        labels=["micro", "petit", "moyen", "grand", "tres_grand", "domaine"]
    ).astype(str)

    df.drop(columns=["_text_all"], inplace=True)

    df["km_distance"] = df["titre"].apply(extract_km)
    if "localisation" in df.columns:
        mask = df["km_distance"] == 0
        df.loc[mask, "km_distance"] = df.loc[mask, "localisation"].apply(extract_km)

    # Targets
    df["pm2"]      = df["prix_num"] / df["surface_num"]
    df["log_pm2"]  = np.log(df["pm2"])
    df["log_prix"] = np.log(df["prix_num"])

    df["log_surface"]    = np.log1p(df["surface_num"])
    df["log_surface_sq"] = df["log_surface"] ** 2
    df["log_surface_cb"] = df["log_surface"] ** 3

    print(f" Données chargées — {df.shape[0]} lignes, {df['zone_clean'].nunique()} zones")
    return df


# 2. SPLIT + TARGET ENCODING (sans leakage)

def split_and_encode(df, test_size=0.2, random_state=42):
    """Split train/test puis calcule le target encoding sur train uniquement."""
    idx_train, idx_test = train_test_split(df.index, test_size=test_size, random_state=random_state)
    df_train = df.loc[idx_train].copy()
    df_test  = df.loc[idx_test].copy()

    global_log_pm2 = df_train["log_pm2"].mean()
    z_log_pm2_mean = df_train.groupby("zone_clean")["log_pm2"].mean()
    z_log_pm2_std  = df_train.groupby("zone_clean")["log_pm2"].std().fillna(0)
    z_pm2_mean     = df_train.groupby("zone_clean")["pm2"].mean()
    z_prix_median  = df_train.groupby("zone_clean")["prix_num"].median()
    z_count        = df_train.groupby("zone_clean")["prix_num"].count()
    z_surf_mean    = df_train.groupby("zone_clean")["surface_num"].mean()
    z_surf_med     = df_train.groupby("zone_clean")["surface_num"].median()
    city_pm2       = df_train["pm2"].mean()

    _est_tr     = df_train["zone_clean"].map(z_log_pm2_mean).fillna(global_log_pm2)
    _resid_tr   = df_train["log_pm2"].values - _est_tr.values
    z_bias      = pd.Series(_resid_tr, index=df_train.index).groupby(df_train["zone_clean"]).mean()
    global_bias = float(np.mean(_resid_tr))

    stats = dict(
        global_log_pm2=global_log_pm2, z_log_pm2_mean=z_log_pm2_mean,
        z_log_pm2_std=z_log_pm2_std, z_pm2_mean=z_pm2_mean,
        z_prix_median=z_prix_median, z_count=z_count,
        z_surf_mean=z_surf_mean, z_surf_med=z_surf_med, city_pm2=city_pm2,
        z_bias=z_bias, global_bias=global_bias,
    )

    df_train = _add_features(df_train, stats)
    df_test  = _add_features(df_test,  stats)

    all_feats = list(dict.fromkeys(NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES))
    missing = [f for f in all_feats if f not in df_train.columns]
    if missing:
        raise ValueError(f"Features manquantes : {missing}")

    X_train = df_train[all_feats].copy(); y_train = df_train[TARGET_LOG].copy()
    X_test  = df_test[all_feats].copy();  y_test  = df_test[TARGET_LOG].copy()

    print(f" Split — Train : {len(X_train)} | Test : {len(X_test)} | Features : {len(all_feats)}")
    return X_train, X_test, y_train, y_test, df_train, df_test, stats


def _add_features(split_df, stats):
    d = split_df.copy()
    glm  = stats["global_log_pm2"]
    city = stats["city_pm2"]

    d["te_log_pm2_zone"]     = d["zone_clean"].map(stats["z_log_pm2_mean"]).fillna(glm)
    d["te_log_pm2_std"]      = d["zone_clean"].map(stats["z_log_pm2_std"]).fillna(stats["z_log_pm2_std"].mean())
    d["prix_m2_moy_quartier"]= d["zone_clean"].map(stats["z_pm2_mean"]).fillna(city)
    d["prix_median_quartier"]= d["zone_clean"].map(stats["z_prix_median"]).fillna(split_df["prix_num"].median() if "prix_num" in split_df.columns else 1_500_000)
    d["nb_listings_quartier"]= d["zone_clean"].map(stats["z_count"]).fillna(1)
    d["prix_m2_std_quartier"]= d["te_log_pm2_std"]

    d["log_surface"]         = np.log1p(d["surface_num"])
    d["log_surface_sq"]      = d["log_surface"] ** 2
    d["log_surface_cb"]      = d["log_surface"] ** 3
    d["palier_surface"]      = pd.cut(d["surface_num"], bins=[0,200,500,1000,5000,20000,np.inf], labels=[0,1,2,3,4,5]).astype(int)
    d["ratio_pm2_city"]      = d["prix_m2_moy_quartier"] / city
    d["surface_x_quartier"]  = d["surface_num"] * d["prix_median_quartier"] / 1e6
    d["surface_log_x_pm2"]   = d["log_surface"] * d["prix_m2_moy_quartier"] / 1e3
    d["surface_x_te"]      = d["log_surface"] * d["te_log_pm2_zone"]
    d["usage_x_te"]         = d.get("usage_score", pd.Series(0, index=d.index)) * d["te_log_pm2_zone"]
    d["prix_estime"]         = d["surface_num"] * d["prix_m2_moy_quartier"]
    d["log_prix_estime"]     = np.log1p(d["prix_estime"])
    d["km_x_log_surface"]    = d["km_distance"] * d["log_surface"]
    d["surface_relative"]    = d["surface_num"] / d["zone_clean"].map(stats["z_surf_mean"]).fillna(d["surface_num"].mean())
    d["residuel_surface"]    = d["surface_num"] - d["zone_clean"].map(stats["z_surf_med"]).fillna(d["surface_num"].median())
    d["score_terrain"]       = d[["piscine","jardin","securite","vue","parking"]].sum(axis=1)
    d["score_standing"]      = d[["piscine","terrasse","vue","hammam","climatisation","securite"]].sum(axis=1)
    d["nb_equipements"]      = d[["piscine","parking","ascenseur","terrasse","jardin","climatisation","securite","vue","cave","hammam"]].sum(axis=1)
    d["surface_par_chambre"] = d["surface_num"]
    # zone_bias v5
    d["zone_bias"] = d["zone_clean"].map(stats.get("z_bias", pd.Series(dtype=float))).fillna(stats.get("global_bias", 0.0))
    return d


# 3. PIPELINE SKLEARN

def build_pipeline(X_train, xgb_params: dict = None):
    num_cols = [c for c in NUMERIC_FEATURES     if c in X_train.columns]
    bin_cols = [c for c in BINARY_FEATURES      if c in X_train.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_train.columns]

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("bin", "passthrough",    bin_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ], remainder="drop")

    # Meilleurs params — optimisés Optuna sur log(pm²) v4 (CV R² ≈ 0.613)
    default_xgb = dict(
        n_estimators       = 2700,
        learning_rate      = 0.004172438137693218,
        max_depth          = 4,
        max_leaves         = 26,
        subsample          = 0.622797828708542,
        colsample_bytree   = 0.4245070522261288,
        colsample_bylevel  = 0.4842906243582357,
        min_child_weight   = 2,
        reg_alpha          = 0.0007450300699947231,
        reg_lambda         = 0.00017742248955133856,
        gamma              = 0.30309227677893574,
        tree_method        = "hist",
        random_state       = 42,
        n_jobs             = -1,
    )
    if xgb_params:
        default_xgb.update(xgb_params)

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", XGBRegressor(**default_xgb)),
    ])
    print(f" Pipeline — num:{len(num_cols)} bin:{len(bin_cols)} cat:{len(cat_cols)}")
    return pipeline


# 4. ENTRAÎNEMENT

def train(pipeline, X_train, y_train):
    pipeline.fit(X_train, y_train)
    print(" Entraînement terminé (cible = log pm²)")
    return pipeline


# 5. ÉVALUATION

def evaluate(pipeline, X_test, y_test, df_test, X_train=None, y_train=None, cv_folds: int = 5):
    """
    y_test  : log(pm²) — cible du modèle
    df_test : DataFrame avec colonnes surface_num et prix_num pour back-transform
    X_train/y_train : si fournis, CV calculée sur train (sans leakage)
    """
    log_pm2_pred = pipeline.predict(X_test)
    log_pm2_true = y_test.values

    #  Métriques sur log_pm² (même échelle que le CV) 
    r2_log   = r2_score(log_pm2_true, log_pm2_pred)
    mape_log = np.mean(np.abs((log_pm2_true - log_pm2_pred) / log_pm2_true)) * 100

    #  Métriques sur prix bruts MAD (back-transform) 
    y_pred_mad = np.exp(log_pm2_pred) * df_test["surface_num"].values
    y_true_mad = df_test["prix_num"].values

    mae       = mean_absolute_error(y_true_mad, y_pred_mad)
    rmse      = np.sqrt(mean_squared_error(y_true_mad, y_pred_mad))
    r2_prix   = r2_score(y_true_mad, y_pred_mad)
    mape_prix = np.mean(np.abs((y_true_mad - y_pred_mad) / y_true_mad)) * 100

    #  CV sur X_train ─
    cv_X  = X_train if X_train is not None else X_test
    cv_y  = y_train if y_train is not None else y_test
    kf    = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_r2 = cross_val_score(pipeline, cv_X, cv_y, cv=kf, scoring="r2")

    metrics = {
        "MAE (MAD)": mae, "RMSE (MAD)": rmse,
        "R²": r2_log, "R2": r2_log,
        "R² (prix MAD)": r2_prix,
        "MAPE (%)": mape_log,
        "MAPE (prix %)": mape_prix,
        "CV R² (mean)": cv_r2.mean(), "CV R² (std)": cv_r2.std(),
    }

    print("\n" + "═" * 52)
    print("  MÉTRIQUES D'ÉVALUATION — TERRAIN v5")
    print("═" * 52)
    print(f"   Sur log(pm²)  [comparable au CV] ")
    print(f"  R² (log pm²)     : {r2_log:>15.4f}")
    print(f"  MAPE (log pm²)   : {mape_log:>13.2f} %")
    print(f"  CV R² ({cv_folds} folds)  : {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
    print(f"   Sur prix bruts MAD  [business] ")
    print(f"  MAE              : {mae:>15,.0f} MAD")
    print(f"  RMSE             : {rmse:>15,.0f} MAD")
    print(f"  R² (prix MAD)    : {r2_prix:>15.4f}  ← amplifié par exp()")
    print(f"  MAPE (prix MAD)  : {mape_prix:>13.2f} %  ← amplifié par exp()")
    print("═" * 52)
    return metrics


# 6. VISUALISATIONS

def plot_results(pipeline, X_test, df_test):
    log_pm2_pred = pipeline.predict(X_test)
    y_pred_mad   = np.exp(log_pm2_pred) * df_test["surface_num"].values
    y_true_mad   = df_test["prix_num"].values
    residuals    = y_true_mad - y_pred_mad

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Évaluation XGBoost — Prix Terrains Marrakech v4", fontsize=14, fontweight="bold", y=1.01)

    ax = axes[0, 0]
    ax.scatter(y_true_mad/1e6, y_pred_mad/1e6, alpha=0.4, s=18, color="#2563EB")
    lims = [min(y_true_mad.min(), y_pred_mad.min())/1e6, max(y_true_mad.max(), y_pred_mad.max())/1e6]
    ax.plot(lims, lims, "r--", linewidth=1.5, label="Parfait")
    ax.set_xlabel("Prix réel (millions MAD)"); ax.set_ylabel("Prix prédit (millions MAD)")
    ax.set_title("Prédictions vs Valeurs réelles"); ax.legend(); ax.grid(True, alpha=0.3)

    ax = axes[0, 1]
    ax.hist(residuals/1e3, bins=60, color="#10B981", edgecolor="white", linewidth=0.5)
    ax.axvline(0, color="red", linestyle="--", linewidth=1.5)
    ax.set_xlabel("Résidu (milliers MAD)"); ax.set_ylabel("Fréquence")
    ax.set_title("Distribution des résidus"); ax.grid(True, alpha=0.3)

    ax = axes[1, 0]
    ax.scatter(y_pred_mad/1e6, residuals/1e3, alpha=0.4, s=18, color="#F59E0B")
    ax.axhline(0, color="red", linestyle="--", linewidth=1.5)
    ax.set_xlabel("Prix prédit (millions MAD)"); ax.set_ylabel("Résidu (milliers MAD)")
    ax.set_title("Résidus vs Prédictions"); ax.grid(True, alpha=0.3)

    ax = axes[1, 1]
    preprocessor = pipeline.named_steps["preprocessor"]
    model        = pipeline.named_steps["model"]
    try:
        num_names = list(preprocessor.transformers_[0][2])
        bin_names = list(preprocessor.transformers_[1][2])
        cat_names = list(preprocessor.transformers_[2][1].get_feature_names_out(CATEGORICAL_FEATURES))
        feature_names = num_names + bin_names + cat_names
    except Exception:
        feature_names = [f"f{i}" for i in range(model.n_features_in_)]
    importances = model.feature_importances_
    top_n = min(15, len(feature_names))
    idx   = np.argsort(importances)[-top_n:]
    ax.barh([feature_names[i] for i in idx], importances[idx], color="#6366F1")
    ax.set_xlabel("Importance"); ax.set_title(f"Top {top_n} Feature Importances"); ax.grid(True, alpha=0.3, axis="x")

    plt.tight_layout()
    plt.savefig("terrain_model_evaluation.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("✅ Graphiques sauvegardés → terrain_model_evaluation.png")


# 7. PRÉDICTION

def predict_price(pipeline, terrain: dict, stats: dict) -> float:
    """
    Prédit le prix d'un terrain.
    stats : dict retourné par split_and_encode() (contient les stats de zone).
    """
    t = terrain.copy()
    t.setdefault("zone_clean", "Autre")
    t.setdefault("source_clean", "avito")
    t.setdefault("is_particulier", 0)
    t.setdefault("km_distance", 0)

    # Champs binaires et misc par défaut à 0 — AVANT _add_features qui les utilise
    row_df = pd.DataFrame([t])
    for col in BINARY_FEATURES:
        if col not in row_df.columns:
            row_df[col] = 0
    for col in ["etage", "etage_known", "chambres_num", "salles_bain_num"]:
        if col not in row_df.columns:
            row_df[col] = 0
    row_df["surface_par_chambre"] = row_df["surface_num"]

    #  Dérivation features Antigravity (même logique que load_data) ─
    USAGE_SCORE_MAP = {
        "agricole":-3,"industriel":-1,"villa":0,"non_precise":0,
        "lotissement":2,"immeuble_r1":1,"immeuble_r2":2,"immeuble_r3":3,"immeuble_r4_plus":4,
    }
    usage_val = t.get("usage", "non_precise") or "non_precise"
    row_df["usage_score"] = USAGE_SCORE_MAP.get(str(usage_val), 0)
    row_df["usage_cat"] = (
        "immeuble" if "immeuble" in str(usage_val) or str(usage_val) == "lotissement"
        else str(usage_val) if str(usage_val) in ("villa","agricole","industriel") else "non_precise"
    )

    titre_val = str(t.get("titre_juridique", "") or "")
    row_df["is_titre_foncier"] = int(titre_val == "titre_foncier")
    row_df["is_melkiya"]       = int(titre_val == "melkiya")
    row_df["statut_titre"]     = titre_val if titre_val in ("titre_foncier","melkiya","en_cours") else "non_specifie"

    topo_val = str(t.get("topographie", "") or "")
    row_df["is_plat"]  = int(topo_val == "plat")
    forme_val = str(t.get("forme", "") or "")
    row_df["is_angle"] = int(forme_val == "angle")

    row_df["is_viabilise"] = int(bool(t.get("viabilise", False)))
    row_df["has_eau"]      = int(bool(t.get("eau", False)))
    row_df["is_negociable"]= int(bool(t.get("negociable", False)))

    R_PLUS_MAP = {"R+1":1,"R+2":2,"R+3":3,"R+4":4,"R+5":5}
    row_df["r_plus_num"] = R_PLUS_MAP.get(str(t.get("r_plus","") or ""), 0)

    row_df["nb_photos_clean"] = float(t.get("nb_photos", 0) or 0)

    # NLP keywords — défaut 0 (pas de texte disponible en prédiction unitaire)
    for kw in ["kw_immeuble","kw_agricole","kw_villa_zone","kw_tf","kw_melk",
               "kw_facade","kw_projet","kw_urgent","kw_resid","kw_plat",
               "terrain_quality","is_industriel","is_lotissement","is_agricole",
               "is_zone_villa","is_constructible","is_hectare","is_r2_r3",
               "is_residentiel","is_golf"]:
        if kw not in row_df.columns:
            row_df[kw] = 0

    row_df["terrain_quality"] = (
        row_df["kw_immeuble"]    * 4 +
        row_df["kw_facade"]      * 3 +
        row_df["is_golf"]        * 3 +
        row_df["kw_villa_zone"]  * 2 +
        row_df["is_constructible"] * 2 +
        row_df["is_viabilise"]   * 2 +
        row_df["kw_plat"]        * 1 +
        row_df["kw_tf"]          * 1 -
        row_df["kw_agricole"]    * 3 -
        row_df["is_industriel"]  * 1
    )

    # surface_cat
    surf = t.get("surface_num", 0)
    if surf <= 300:     row_df["surface_cat"] = "micro"
    elif surf <= 1000:  row_df["surface_cat"] = "petit"
    elif surf <= 5000:  row_df["surface_cat"] = "moyen"
    elif surf <= 20000: row_df["surface_cat"] = "grand"
    elif surf <= 100000:row_df["surface_cat"] = "tres_grand"
    else:               row_df["surface_cat"] = "domaine"

    row_df = _add_features(row_df, stats)

    all_feats = list(dict.fromkeys(NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES))
    log_pm2_pred = pipeline.predict(row_df[all_feats])[0]
    prix_mad     = np.exp(log_pm2_pred) * t["surface_num"]

    print(f"  Terrain  : {t.get('surface_num')} m²  |  Zone : {t.get('zone_clean', 'N/A')}")
    print(f" Prix estimé : {prix_mad:,.0f} MAD  ({prix_mad/10.8:,.0f} EUR)")
    pm2_mad = prix_mad / t["surface_num"]
    print(f"   Prix/m²    : {pm2_mad:,.0f} MAD/m²")
    return {"prix_estime": prix_mad, "pm2": pm2_mad}
if __name__ == "__main__":
    import os, joblib, json
    from datetime import datetime
    print("Loading data...")
    df = load_data("../data/marrakech_immo_vente/terrain_vente.csv")
    X_train, X_test, y_train, y_test, df_train, df_test, stats = split_and_encode(df)
    print("Building pipeline...")
    pipeline = build_pipeline(X_train)
    print("Training pipeline...")
    pipeline = train(pipeline, X_train, y_train)
    print("Evaluating...")
    metrics = evaluate(pipeline, X_test, y_test, df_test)
    
    MODEL_PATH = "../model_training/models/xgb_terrain_vente_pip.pkl"
    META_PATH  = "../model_training/models/xgb_terrain_vente_metadata_pip.json"
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({"pipeline": pipeline, "stats": stats}, MODEL_PATH)
    print(f" Modèle sauvegardé -> {MODEL_PATH}")

    metadata = {
        "date"           : datetime.now().strftime("%Y-%m-%d"),
        "version"        : "v4_optuna_optimized",
        "modele"         : "XGBRegressor",
        "type_bien"      : "terrain_vente",
        "target"         : "log(pm2)",
        "n_lignes_train" : len(X_train),
        "n_lignes_test"  : len(X_test),
        "n_features"     : len(X_train.columns),
        "n_zones"        : int(df["zone_clean"].nunique()),
        "metriques_test" : {
            "R2"   : round(metrics["R²"], 4),
            "MAE"  : round(metrics["MAE (MAD)"], 0),
            "RMSE" : round(metrics["RMSE (MAD)"], 0),
            "MAPE" : round(metrics["MAPE (%)"], 2),
        },
        "affichage_site" : "Fourchette ±40% obligatoire pour les terrains",
        "formule"        : "prix_min = prix_estime × 0.60 | prix_max = prix_estime × 1.60",
    }

    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f" Métadonnées sauvegardées -> {META_PATH}")
