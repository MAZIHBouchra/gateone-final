"""
pip_terrain.py  v3
==================
Pipeline terrain Marrakech — cible log(prix/m²) + target encoding zone.
Améliorations v3 :
  • Zone extraction élargie (40+ zones depuis titre/localisation/description)
  • Cible : log(prix/m²) — décorrèle surface et prix/m²
  • Target encoding zone (stats calculées sur train uniquement)
  • NLP étendu : is_constructible, is_hectare, is_r2_r3, is_residentiel, is_golf, is_viabilise
"""

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


# ══════════════════════════════════════════════════════════════════════════════
# CONSTANTES
# ══════════════════════════════════════════════════════════════════════════════

NUMERIC_FEATURES = [
    "surface_num", "log_surface", "log_surface_sq", "log_surface_cb",
    "palier_surface", "surface_relative", "residuel_surface",
    "surface_x_quartier", "surface_log_x_pm2",
    "prix_m2_moy_quartier", "prix_m2_std_quartier", "prix_median_quartier",
    "prix_estime", "log_prix_estime", "nb_listings_quartier",
    "km_distance", "ratio_pm2_city", "km_x_log_surface",
    "te_log_pm2_zone", "te_log_pm2_std",
    "score_terrain", "score_standing", "nb_equipements",
    "chambres_num", "salles_bain_num", "etage", "etage_known", "surface_par_chambre",
]

BINARY_FEATURES = [
    "piscine", "parking", "jardin", "securite", "vue",
    "terrasse", "neuf", "meuble", "climatisation", "hammam", "cave", "ascenseur",
    "is_particulier",
    "is_industriel", "is_lotissement", "is_agricole", "is_zone_villa",
    "is_constructible", "is_hectare", "is_r2_r3", "is_residentiel",
    "is_golf", "is_viabilise",
]

CATEGORICAL_FEATURES = ["zone_clean", "source_clean"]

TARGET_RAW   = "prix_num"
TARGET_LOG   = "log_pm2"   # log(prix/m²)

SURFACE_MIN  = 50
SURFACE_MAX  = 500_000
PRIX_M2_MIN  = 50
PRIX_M2_MAX  = 50_000
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


# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════

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


# ══════════════════════════════════════════════════════════════════════════════
# 1. CHARGEMENT & CLEANING
# ══════════════════════════════════════════════════════════════════════════════

def load_data(path: str):
    """Charge, nettoie et enrichit le CSV terrain. Retourne (df, X, y)."""
    df = pd.read_csv(path)

    # Filtre type de bien
    terrain_types = ["Terrain", "Vente Terrain"]
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

    log_p = np.log(df["prix_num"])
    df = df[(log_p >= log_p.quantile(0.02)) & (log_p <= log_p.quantile(0.98))].copy()
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
    else:
        df["is_particulier"] = 0

    # Zone extraction élargie
    df["zone_clean"] = df.apply(extract_zone, axis=1)

    # NLP Keywords
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

    df["km_distance"] = df["titre"].apply(extract_km)
    if "localisation" in df.columns:
        mask = df["km_distance"] == 0
        df.loc[mask, "km_distance"] = df.loc[mask, "localisation"].apply(extract_km)

    # Targets
    df["pm2"]      = df["prix_num"] / df["surface_num"]
    df["log_pm2"]  = np.log(df["pm2"])
    df["log_prix"] = np.log(df["prix_num"])

    print(f"✅ Données chargées — {df.shape[0]} lignes, {df['zone_clean'].nunique()} zones")
    return df


# ══════════════════════════════════════════════════════════════════════════════
# 2. SPLIT + TARGET ENCODING (sans leakage)
# ══════════════════════════════════════════════════════════════════════════════

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

    stats = dict(
        global_log_pm2=global_log_pm2, z_log_pm2_mean=z_log_pm2_mean,
        z_log_pm2_std=z_log_pm2_std, z_pm2_mean=z_pm2_mean,
        z_prix_median=z_prix_median, z_count=z_count,
        z_surf_mean=z_surf_mean, z_surf_med=z_surf_med, city_pm2=city_pm2,
    )

    df_train = _add_features(df_train, stats)
    df_test  = _add_features(df_test,  stats)

    all_feats = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES
    missing = [f for f in all_feats if f not in df_train.columns]
    if missing:
        raise ValueError(f"Features manquantes : {missing}")

    X_train = df_train[all_feats].copy(); y_train = df_train[TARGET_LOG].copy()
    X_test  = df_test[all_feats].copy();  y_test  = df_test[TARGET_LOG].copy()

    print(f"✅ Split — Train : {len(X_train)} | Test : {len(X_test)} | Features : {len(all_feats)}")
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
    d["prix_estime"]         = d["surface_num"] * d["prix_m2_moy_quartier"]
    d["log_prix_estime"]     = np.log1p(d["prix_estime"])
    d["km_x_log_surface"]    = d["km_distance"] * d["log_surface"]
    d["surface_relative"]    = d["surface_num"] / d["zone_clean"].map(stats["z_surf_mean"]).fillna(d["surface_num"].mean())
    d["residuel_surface"]    = d["surface_num"] - d["zone_clean"].map(stats["z_surf_med"]).fillna(d["surface_num"].median())
    d["score_terrain"]       = d[["piscine","jardin","securite","vue","parking"]].sum(axis=1)
    d["score_standing"]      = d[["piscine","terrasse","vue","hammam","climatisation","securite"]].sum(axis=1)
    d["nb_equipements"]      = d[["piscine","parking","ascenseur","terrasse","jardin","climatisation","securite","vue","cave","hammam"]].sum(axis=1)
    d["surface_par_chambre"] = d["surface_num"]
    return d


# ══════════════════════════════════════════════════════════════════════════════
# 3. PIPELINE SKLEARN
# ══════════════════════════════════════════════════════════════════════════════

def build_pipeline(X_train, xgb_params: dict = None):
    num_cols = [c for c in NUMERIC_FEATURES     if c in X_train.columns]
    bin_cols = [c for c in BINARY_FEATURES      if c in X_train.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_train.columns]

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("bin", "passthrough",    bin_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ], remainder="drop")

    # Meilleurs params — optimisés Optuna sur log(pm²) v3
    default_xgb = dict(
        n_estimators       = 2182,
        learning_rate      = 0.027595447930763673,
        max_depth          = 6,
        max_leaves         = 43,
        subsample          = 0.8039610168351743,
        colsample_bytree   = 0.5928126427210324,
        colsample_bylevel  = 0.5300455566310018,
        min_child_weight   = 6,
        reg_alpha          = 0.17035135235374574,
        reg_lambda         = 1.5956247443531595,
        gamma              = 1.011871419429241,
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
    print(f"✅ Pipeline — num:{len(num_cols)} bin:{len(bin_cols)} cat:{len(cat_cols)}")
    return pipeline


# ══════════════════════════════════════════════════════════════════════════════
# 4. ENTRAÎNEMENT
# ══════════════════════════════════════════════════════════════════════════════

def train(pipeline, X_train, y_train):
    pipeline.fit(X_train, y_train)
    print("✅ Entraînement terminé (cible = log pm²)")
    return pipeline


# ══════════════════════════════════════════════════════════════════════════════
# 5. ÉVALUATION
# ══════════════════════════════════════════════════════════════════════════════

def evaluate(pipeline, X_test, y_test, df_test, cv_folds: int = 5):
    """
    y_test  : log(pm²) — cible du modèle
    df_test : DataFrame avec colonnes surface_num et prix_num pour back-transform
    """
    log_pm2_pred = pipeline.predict(X_test)
    y_pred_mad   = np.exp(log_pm2_pred) * df_test["surface_num"].values
    y_true_mad   = df_test["prix_num"].values

    mae  = mean_absolute_error(y_true_mad, y_pred_mad)
    rmse = np.sqrt(mean_squared_error(y_true_mad, y_pred_mad))
    r2   = r2_score(y_true_mad, y_pred_mad)
    mape = np.mean(np.abs((y_true_mad - y_pred_mad) / y_true_mad)) * 100

    kf    = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_r2 = cross_val_score(pipeline, X_test, y_test, cv=kf, scoring="r2")

    metrics = {
        "MAE (MAD)": mae, "RMSE (MAD)": rmse, "R²": r2, "MAPE (%)": mape,
        "CV R² (mean)": cv_r2.mean(), "CV R² (std)": cv_r2.std(),
    }

    print("\n" + "═" * 45)
    print("  MÉTRIQUES D'ÉVALUATION — TERRAIN v3")
    print("═" * 45)
    print(f"  MAE              : {mae:>15,.0f} MAD")
    print(f"  RMSE             : {rmse:>15,.0f} MAD")
    print(f"  R²               : {r2:>15.4f}")
    print(f"  MAPE             : {mape:>14.2f} %")
    print(f"  CV R² ({cv_folds} folds)  : {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
    print("═" * 45)
    return metrics


# ══════════════════════════════════════════════════════════════════════════════
# 6. VISUALISATIONS
# ══════════════════════════════════════════════════════════════════════════════

def plot_results(pipeline, X_test, df_test):
    log_pm2_pred = pipeline.predict(X_test)
    y_pred_mad   = np.exp(log_pm2_pred) * df_test["surface_num"].values
    y_true_mad   = df_test["prix_num"].values
    residuals    = y_true_mad - y_pred_mad

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Évaluation XGBoost — Prix Terrains Marrakech v3", fontsize=14, fontweight="bold", y=1.01)

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


# ══════════════════════════════════════════════════════════════════════════════
# 7. PRÉDICTION
# ══════════════════════════════════════════════════════════════════════════════

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

    # Applique features dérivées
    row_df = pd.DataFrame([t])
    row_df = _add_features(row_df, stats)

    # Champs binaires par défaut à 0
    for col in BINARY_FEATURES:
        row_df.setdefault(col, 0)
    for col in ["etage", "etage_known", "chambres_num", "salles_bain_num"]:
        row_df[col] = 0
    row_df["surface_par_chambre"] = row_df["surface_num"]

    all_feats = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES
    log_pm2_pred = pipeline.predict(row_df[all_feats])[0]
    prix_mad     = np.exp(log_pm2_pred) * t["surface_num"]

    print(f"🏗️  Terrain  : {t.get('surface_num')} m²  |  Zone : {t.get('zone_clean', 'N/A')}")
    print(f"💰 Prix estimé : {prix_mad:,.0f} MAD  ({prix_mad/10.8:,.0f} EUR)")
    print(f"   Prix/m²    : {prix_mad/t['surface_num']:,.0f} MAD/m²")
    return prix_mad
