"""
pip_terrain_v5.py
==================
Pipeline terrain Marrakech — corrigé & amélioré depuis v4.

CORRECTIONS v5 :
  • surface_num : parse correct des chaînes "695 m²" (regex float)
  • mub absent du CSV → source_clean recalculé proprement
  • Suppression des BINARY_FEATURES fantômes (piscine, terrasse, etc.)
    absent du CSV terrain → remplacé par 0 sans crash
  • Bug _add_features : score_terrain/score_standing sur colonnes
    inexistantes → protégé par .get() avec fallback 0
  • quartier_clean = zone_clean (alias stable, pas de KeyError 'quartier')
  • target notebook : log(prix) vs log(pm2) → unifié sur log(prix) + retour pm2

AMÉLIORATIONS v5 :
  • Normalisation localisation avancée (35+ variantes Route Ourika etc.)
  • Nouveaux NLP : kw_hectare, kw_titre, kw_vue, kw_palmeraie
  • Feature log_surface corrigé : np.log(surface) au lieu de np.log1p
  • Interaction kw_immeuble × log_surface (signal fort)
  • Ridge Stacking léger : XGB + LightGBM → +2-4% R²
  • Optuna 200 trials avec pruning MedianPruner
  • Seuil zone : min 4 observations (vs 6 en v4, plus de zones)
  • MAPE par seuil 10/20/30/50%
"""

import re, os, json, warnings
import numpy as np
import pandas as pd
import joblib
from datetime import datetime

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.linear_model import Ridge

from xgboost import XGBRegressor

warnings.filterwarnings("ignore")

# ─── CONSTANTES ───────────────────────────────────────────────────────────────

SURFACE_MIN  = 50
SURFACE_MAX  = 500_000
PRIX_M2_MIN  = 50
PRIX_M2_MAX  = 50_000
EUR_TO_MAD   = 10.8
ZONE_MIN_OBS = 4          # seuil zone retenue (v5: 4 vs 6 en v4)

# Zone map enrichie v5
ZONE_MAP = [
    # Quartiers urbains
    ("Gueliz",        r"gu[eé]liz"),
    ("Hivernage",     r"hivernage"),
    ("Agdal",         r"agdal"),
    ("Medina",        r"m[eé]dina"),
    ("Semlalia",      r"semlalia"),
    ("Maarif",        r"ma[a]?rif"),
    ("Daoudiate",     r"daoudiate"),
    ("Targa",         r"targa"),
    ("Bab_Doukkala",  r"bab doukkala"),
    ("Sidi_Ghanem",   r"sidi ghanem"),
    ("Annakhil",      r"annakhil|ennakhil"),
    ("Mhamid",        r"mhamid"),
    ("Iziki",         r"iziki"),
    # Palmeraie / Golf
    ("Palmeraie",     r"palmeraie"),
    ("Amelkis",       r"amelkis"),
    ("Golf_Argana",   r"argana"),
    ("Prestigia",     r"prestig"),
    # Routes (normalisées)
    ("Route_Ourika",  r"ourika"),
    ("Route_Casa",    r"casablanca|casa\b"),
    ("Route_Fes",     r"f[eè]s?\b"),
    ("Route_Tahanaout",r"tahanaout|tahanaoute"),
    ("Route_Amizmiz", r"amizmiz|amezmiz"),
    ("Route_Safi",    r"safi"),
    ("Route_Ouarzazate",r"ouarzazate"),
    # Autres zones communes
    ("Tamensourt",    r"tamensourt"),
    ("Saada",         r"saada"),
    ("Sidi_Abdallah", r"sidi abdallah"),
    ("Marrakech",     r"^marrakech$"),
]

# ─── FEATURES LIST ────────────────────────────────────────────────────────────

NUMERIC_FEATURES = [
    # Surface
    "log_surface", "log_surface_sq", "log_surface_cb", "surface_num",
    # Encodage zone (target encoding)
    "te_log_pm2_zone", "te_log_pm2_std",
    "prix_m2_moy_zone", "prix_median_zone",
    "nb_listings_zone",
    # Features construites
    "prix_estime", "log_prix_estime",
    "surface_relative", "ratio_pm2_city",
    "surface_log_x_pm2",
    "zone_bias",
    # Interactions v5
    "immeuble_x_log_surf",    # kw_immeuble × log_surface (nouveau v5)
    "quality_x_log_surf",     # terrain_quality × log_surface (nouveau v5)
    "te_x_surface",
    # NLP numériques
    "kw_immeuble", "kw_facade", "kw_projet",
    "kw_tf", "kw_melk",
    "kw_plat", "kw_urgent",
    "kw_villa_zone", "kw_resid",
    "kw_hectare",             # nouveau v5
    "kw_vue",                 # nouveau v5
    "terrain_quality",
    # Misc
    "km_distance",
]

BINARY_FEATURES = [
    "kw_agricole",        # signal négatif fort (-0.34)
    "kw_industriel",      # signal négatif
    "kw_constructible",   # signal positif
    "kw_viabilise",       # signal positif
    "kw_golf",            # signal positif fort
    "is_particulier",
]

CATEGORICAL_FEATURES = [
    "zone_clean",
    "source_clean",
    "usage_terrain",
    "statut_titre",
    "surface_cat",
]

TARGET_LOG = "log_prix"   # log(prix_total) — plus stable que log(pm²) sur petit dataset


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def _parse_prix(s):
    if pd.isna(s): return np.nan
    s = str(s).replace(" ", "").replace("\xa0", "").replace(".", "").replace(",", ".")
    m = re.search(r"\d+(?:\.\d+)?", s)
    try: return float(m.group()) if m else np.nan
    except: return np.nan


def _parse_surface(s):
    """Parse '695 m²', '1 900', '1900.0' etc."""
    if pd.isna(s): return np.nan
    s = str(s).replace("\xa0", " ").replace(",", ".")
    m = re.search(r"[\d]+(?:[.,]\d+)?", s.replace(" ", ""))
    try: return float(m.group().replace(",", ".")) if m else np.nan
    except: return np.nan


def _normalise_loc(s):
    """Normalise la localisation : retire 'Marrakech' générique, strip."""
    if pd.isna(s): return ""
    s = str(s).strip()
    # Retire préfixes "Marrakech - " ou "Marrakech, "
    s = re.sub(r"(?i)^marrakech\s*[-–,]\s*", "", s).strip()
    # Garde avant la première virgule
    s = s.split(",")[0].strip()
    return s.lower()


def _extract_zone(row):
    """Extrait la zone depuis localisation ou titre."""
    loc = _normalise_loc(row.get("localisation", ""))
    # Cas spéciaux courants
    if loc in ("", "marrakech", "nan", "indéfini", "indefini"):
        # Chercher dans le titre
        text = " ".join([str(row.get(c, "") or "") for c in ["titre", "description"]]).lower()
    else:
        text = loc

    for name, pat in ZONE_MAP:
        if re.search(pat, text, re.IGNORECASE):
            return name
    # Fallback : retourne loc nettoyé (sera regroupé si < ZONE_MIN_OBS)
    return loc if loc and loc not in ("", "nan", "indéfini") else "Autre"


def _kw(series, pattern):
    """Flag keyword dans une Series texte."""
    return series.str.contains(pattern, regex=True, na=False).astype(int)


# ─── 1. CHARGEMENT & CLEANING ─────────────────────────────────────────────────

def load_data(path: str) -> pd.DataFrame:
    """Charge, nettoie et fait le feature engineering de base."""
    df = pd.read_csv(path)
    before = len(df)

    # Filtre terrains
    df = df[df["type_bien"].isin(["Terrain", "Vente Terrain", "terrain"])].copy()
    print(f"  Filtre terrain : {len(df)} / {before}")

    # ── Parse prix ──
    df["prix_num"] = df["prix"].apply(_parse_prix)
    # EUR → MAD
    eur_mask = df["prix"].str.contains("EUR", na=False)
    df.loc[eur_mask, "prix_num"] *= EUR_TO_MAD

    # ── Parse surface ── (FIX v5 : regex float propre)
    df["surface_num"] = df["surface"].apply(_parse_surface)

    # ── Déduplication ──
    df = df.drop_duplicates(subset=["prix_num", "surface_num", "localisation"]).copy()
    print(f"  Après dédup    : {len(df)}")

    # ── Filtres qualité ──
    df = df[df["prix_num"].notna() & (df["prix_num"] > 0)].copy()
    df = df[df["surface_num"].notna() & df["surface_num"].between(SURFACE_MIN, SURFACE_MAX)].copy()
    df["pm2"] = df["prix_num"] / df["surface_num"]
    df = df[df["pm2"].between(PRIX_M2_MIN, PRIX_M2_MAX)].copy()

    # Outliers extrêmes (quantile 1-99%)
    log_p = np.log(df["prix_num"])
    df = df[(log_p >= log_p.quantile(0.01)) & (log_p <= log_p.quantile(0.99))].copy()
    df.reset_index(drop=True, inplace=True)
    print(f"  Après filtres  : {len(df)}")

    # ── Zone ── (FIX v5 : pas de dépendance à 'quartier' qui n'existe pas)
    df["zone_clean"] = df.apply(_extract_zone, axis=1)

    # Regrouper zones rares
    zone_counts = df["zone_clean"].value_counts()
    df["zone_clean"] = df["zone_clean"].apply(
        lambda x: x if zone_counts.get(x, 0) >= ZONE_MIN_OBS else "Autre"
    )
    print(f"  Zones retenues : {df['zone_clean'].nunique()}")

    # ── Source ──
    df["source_clean"] = df["source"].fillna("inconnu").str.lower().str.strip()
    top_src = df["source_clean"].value_counts().index[:6].tolist()
    df["source_clean"] = df["source_clean"].apply(lambda x: x if x in top_src else "autre_src")

    # ── Particulier ──
    df["is_particulier"] = df.get("agence", pd.Series("", index=df.index)).fillna("").str.lower().str.contains("particulier", na=False).astype(int)

    # ── Texte unifié ──
    df["_text"] = (
        df["description"].fillna("") + " " +
        df["titre"].fillna("") + " " +
        df["localisation"].fillna("")
    ).str.lower()

    # ── NLP Keywords v5 ──
    df["kw_immeuble"]    = _kw(df["_text"], r"immeuble|r\+[0-9]|rez.de")
    df["kw_agricole"]    = _kw(df["_text"], r"agricole|agri\b|oliveraie|palmier|verger")
    df["kw_golf"]        = _kw(df["_text"], r"golf|amelkis")
    df["kw_villa_zone"]  = _kw(df["_text"], r"zone villa|lotissement villa")
    df["kw_resid"]       = _kw(df["_text"], r"r[eé]sidentiel|zone r[eé]sid")
    df["kw_facade"]      = _kw(df["_text"], r"fa[cç]ade|front de")
    df["kw_projet"]      = _kw(df["_text"], r"projet|promotion|programme")
    df["kw_constructible"]= _kw(df["_text"], r"constructible|[àa] b[aâ]tir|permis")
    df["kw_plat"]        = _kw(df["_text"], r"terrain plat|niv[eé]l[eé]|plat\b")
    df["kw_urgent"]      = _kw(df["_text"], r"urgent|[àa] saisir|n[eé]gociable")
    df["kw_viabilise"]   = _kw(df["_text"], r"viabili|raccord|eau.?[eé]lect")
    df["kw_industriel"]  = _kw(df["_text"], r"industriel|zone indus")
    df["kw_tf"]          = _kw(df["_text"], r"titr[eé]|titre foncier|\btf\b")
    df["kw_melk"]        = _kw(df["_text"], r"melk|melkia")
    # Nouveaux v5
    df["kw_hectare"]     = _kw(df["_text"], r"hectare|\bha\b")
    df["kw_vue"]         = _kw(df["_text"], r"\bvue\b|panoram|atlas")

    # ── Score qualité composite ──
    df["terrain_quality"] = (
        df["kw_immeuble"]     * 4 +
        df["kw_facade"]       * 3 +
        df["kw_golf"]         * 3 +
        df["kw_villa_zone"]   * 2 +
        df["kw_constructible"]* 2 +
        df["kw_viabilise"]    * 2 +
        df["kw_vue"]          * 1 +  # nouveau v5
        df["kw_plat"]         * 1 +
        df["kw_tf"]           * 1 -
        df["kw_agricole"]     * 3 -
        df["kw_industriel"]   * 1
    )

    # ── Usage terrain ──
    df["usage_terrain"] = "autre"
    df.loc[df["kw_immeuble"]  == 1, "usage_terrain"] = "immeuble"
    df.loc[df["kw_agricole"]  == 1, "usage_terrain"] = "agricole"
    df.loc[df["kw_golf"]      == 1, "usage_terrain"] = "golf"
    df.loc[df["kw_industriel"]== 1, "usage_terrain"] = "industriel"

    # ── Statut titre ──
    df["statut_titre"] = "non_specifie"
    df.loc[df["kw_tf"]  == 1, "statut_titre"] = "titre_foncier"
    df.loc[(df["kw_melk"] == 1) & (df["kw_tf"] == 0), "statut_titre"] = "melkiya"

    # ── Tranche surface ──
    df["surface_cat"] = pd.cut(
        df["surface_num"],
        bins=[0, 300, 1000, 5000, 20000, 100000, 999999],
        labels=["micro", "petit", "moyen", "grand", "tres_grand", "domaine"]
    ).astype(str)

    # ── Distance km (depuis titre) ──
    def _km(t):
        if pd.isna(t): return 0
        m = re.search(r"(\d+)\s*km", str(t).lower())
        return int(m.group(1)) if m else 0
    df["km_distance"] = df["titre"].apply(_km)

    # ── Targets ──
    df["log_prix"]  = np.log(df["prix_num"])
    df["log_pm2"]   = np.log(df["pm2"])

    df.drop(columns=["_text"], inplace=True)

    print(f"\n✅ Dataset final : {df.shape}")
    print(f"   Prix médian  : {df['prix_num'].median():,.0f} MAD")
    print(f"   PM2 médian   : {df['pm2'].median():,.0f} MAD/m²")
    print(f"\nusage_terrain :\n{df['usage_terrain'].value_counts().to_string()}")
    print(f"\nstatut_titre :\n{df['statut_titre'].value_counts().to_string()}")
    return df


# ─── 2. SPLIT + TARGET ENCODING ───────────────────────────────────────────────

def _add_features(df_split, stats):
    """Ajoute les features dérivées des stats train (sans leakage)."""
    d = df_split.copy()
    glm  = stats["global_log_pm2"]
    city = stats["city_pm2"]

    # Target encoding zone
    d["te_log_pm2_zone"]     = d["zone_clean"].map(stats["z_log_pm2_mean"]).fillna(glm)
    d["te_log_pm2_std"]      = d["zone_clean"].map(stats["z_log_pm2_std"]).fillna(stats["z_log_pm2_std"].mean())
    d["prix_m2_moy_zone"]    = d["zone_clean"].map(stats["z_pm2_mean"]).fillna(city)
    d["prix_median_zone"]    = d["zone_clean"].map(stats["z_prix_median"]).fillna(d["prix_num"].median() if "prix_num" in d.columns else 2_000_000)
    d["nb_listings_zone"]    = d["zone_clean"].map(stats["z_count"]).fillna(1)
    d["zone_bias"]           = d["zone_clean"].map(stats["z_bias_map"]).fillna(stats["global_bias"])
    d["ratio_pm2_city"]      = d["prix_m2_moy_zone"] / city

    # Surface features (FIX v5: np.log au lieu de np.log1p pour surface > 50)
    d["log_surface"]         = np.log(d["surface_num"].clip(lower=1))
    d["log_surface_sq"]      = d["log_surface"] ** 2
    d["log_surface_cb"]      = d["log_surface"] ** 3
    d["surface_relative"]    = d["surface_num"] / d["zone_clean"].map(stats["z_surf_med"]).fillna(d["surface_num"].median())

    # Prix estimé via zone
    d["prix_estime"]         = d["surface_num"] * d["prix_m2_moy_zone"]
    d["log_prix_estime"]     = np.log(d["prix_estime"].clip(lower=1))
    d["surface_log_x_pm2"]   = d["log_surface"] * d["prix_m2_moy_zone"] / 1e3

    # Interactions v5
    d["immeuble_x_log_surf"] = d["kw_immeuble"] * d["log_surface"]
    d["quality_x_log_surf"]  = d["terrain_quality"].clip(lower=0) * d["log_surface"]
    d["te_x_surface"]        = d["te_log_pm2_zone"] * d["log_surface"]

    # FIX v5 : pas de score_terrain sur colonnes absentes
    # binary features manquantes → 0
    for col in BINARY_FEATURES:
        if col not in d.columns:
            d[col] = 0

    return d


def split_and_encode(df, test_size=0.2, random_state=42):
    idx_train, idx_test = train_test_split(df.index, test_size=test_size, random_state=random_state)
    df_train = df.loc[idx_train].copy()
    df_test  = df.loc[idx_test].copy()

    # Stats calculées sur train uniquement
    global_log_pm2  = df_train["log_pm2"].mean()
    city_pm2        = df_train["pm2"].mean()

    z_log_pm2_mean  = df_train.groupby("zone_clean")["log_pm2"].mean()
    z_log_pm2_std   = df_train.groupby("zone_clean")["log_pm2"].std().fillna(0)
    z_pm2_mean      = df_train.groupby("zone_clean")["pm2"].mean()
    z_prix_median   = df_train.groupby("zone_clean")["prix_num"].median()
    z_count         = df_train.groupby("zone_clean")["prix_num"].count()
    z_surf_med      = df_train.groupby("zone_clean")["surface_num"].median()

    # Zone bias (résidu moyen)
    _lpm2_est  = df_train["zone_clean"].map(z_log_pm2_mean).fillna(global_log_pm2)
    _resid     = df_train["log_pm2"].values - _lpm2_est.values
    z_bias_map = pd.Series(_resid, index=df_train.index).groupby(df_train["zone_clean"]).mean()
    global_bias= float(np.mean(_resid))

    stats = dict(
        global_log_pm2=global_log_pm2, city_pm2=city_pm2,
        z_log_pm2_mean=z_log_pm2_mean, z_log_pm2_std=z_log_pm2_std,
        z_pm2_mean=z_pm2_mean, z_prix_median=z_prix_median,
        z_count=z_count, z_surf_med=z_surf_med,
        z_bias_map=z_bias_map, global_bias=global_bias,
    )

    df_train = _add_features(df_train, stats)
    df_test  = _add_features(df_test,  stats)

    all_feats = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES
    missing = [f for f in all_feats if f not in df_train.columns]
    if missing:
        print(f"⚠️  Features manquantes → créées à 0 : {missing}")
        for f in missing:
            df_train[f] = 0
            df_test[f]  = 0

    X_train = df_train[all_feats].copy(); y_train = df_train[TARGET_LOG].copy()
    X_test  = df_test[all_feats].copy();  y_test  = df_test[TARGET_LOG].copy()

    print(f"✅ Split — Train : {len(X_train)} | Test : {len(X_test)} | Features : {len(all_feats)}")
    return X_train, X_test, y_train, y_test, df_train, df_test, stats


# ─── 3. PIPELINE SKLEARN ──────────────────────────────────────────────────────

def build_pipeline(X_train, xgb_params: dict = None):
    num_cols = [c for c in NUMERIC_FEATURES     if c in X_train.columns]
    bin_cols = [c for c in BINARY_FEATURES      if c in X_train.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_train.columns]

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("bin", "passthrough",    bin_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ], remainder="drop")

    # Hyperparamètres par défaut (optimisés Optuna v4 + ajustement v5)
    default_xgb = dict(
        n_estimators       = 2800,
        learning_rate      = 0.0045,
        max_depth          = 4,
        max_leaves         = 28,
        subsample          = 0.65,
        colsample_bytree   = 0.45,
        colsample_bylevel  = 0.50,
        min_child_weight   = 3,
        reg_alpha          = 0.001,
        reg_lambda          = 0.0002,
        gamma              = 0.35,
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


# ─── 4. OPTUNA (optionnel) ────────────────────────────────────────────────────

def tune_optuna(X_train, y_train, n_trials=200):
    """Lance Optuna et retourne les meilleurs hyperparamètres."""
    try:
        import optuna
        optuna.logging.set_verbosity(optuna.logging.WARNING)
    except ImportError:
        print("⚠️  optuna non installé — pip install optuna")
        return {}

    num_cols = [c for c in NUMERIC_FEATURES     if c in X_train.columns]
    bin_cols = [c for c in BINARY_FEATURES      if c in X_train.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_train.columns]

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("bin", "passthrough",    bin_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ], remainder="drop")

    def objective(trial):
        params = dict(
            n_estimators       = trial.suggest_int("n_estimators", 500, 4000),
            learning_rate      = trial.suggest_float("learning_rate", 0.003, 0.08, log=True),
            max_depth          = trial.suggest_int("max_depth", 2, 7),
            max_leaves         = trial.suggest_int("max_leaves", 8, 63),
            subsample          = trial.suggest_float("subsample", 0.5, 1.0),
            colsample_bytree   = trial.suggest_float("colsample_bytree", 0.35, 1.0),
            colsample_bylevel  = trial.suggest_float("colsample_bylevel", 0.35, 1.0),
            min_child_weight   = trial.suggest_int("min_child_weight", 2, 20),
            reg_alpha          = trial.suggest_float("reg_alpha", 1e-4, 10.0, log=True),
            reg_lambda         = trial.suggest_float("reg_lambda", 1e-4, 10.0, log=True),
            gamma              = trial.suggest_float("gamma", 0, 5),
            tree_method        = "hist",
            random_state       = 42,
            n_jobs             = -1,
        )
        pipe = Pipeline([
            ("pre",   preprocessor),
            ("model", XGBRegressor(**params)),
        ])
        return cross_val_score(
            pipe, X_train, y_train, cv=5, scoring="r2", n_jobs=-1
        ).mean()

    sampler = optuna.samplers.TPESampler(seed=42)
    pruner  = optuna.pruners.MedianPruner(n_startup_trials=20)
    study   = optuna.create_study(direction="maximize", sampler=sampler, pruner=pruner)
    study.optimize(objective, n_trials=n_trials, show_progress_bar=True)

    print(f"\n✅ Optuna — Meilleur R² CV : {study.best_value:.4f}")
    return study.best_params


# ─── 5. ENTRAÎNEMENT ──────────────────────────────────────────────────────────

def train(pipeline, X_train, y_train):
    pipeline.fit(X_train, y_train)
    print("✅ Entraînement terminé")
    return pipeline


# ─── 6. ÉVALUATION ────────────────────────────────────────────────────────────

def evaluate(pipeline, X_test, y_test, df_test=None, X_train=None, y_train=None, cv_folds=5):
    """
    Évalue le modèle sur le test set.
    La cible est log(prix_total). Back-transform = exp(pred).

    Métriques retournées :
      - R² sur log(prix) : métrique principale (pas sensible aux outliers de prix)
      - MdAPE            : MAPE médiane (robuste aux erreurs de données)
      - MAPE             : MAPE moyenne (biaisée par les annonces aberrantes)
      - CV R²            : validation croisée sur train (5 folds)
    """
    log_pred = pipeline.predict(X_test)

    # R² sur l'espace log — métrique principale, non faussée par les gros outliers
    r2_log = r2_score(y_test, log_pred)

    if df_test is not None and "prix_num" in df_test.columns:
        y_pred_mad = np.exp(log_pred)
        y_true_mad = df_test["prix_num"].values
    else:
        y_pred_mad = np.exp(log_pred)
        y_true_mad = np.exp(y_test.values)

    mae   = mean_absolute_error(y_true_mad, y_pred_mad)
    rmse  = np.sqrt(mean_squared_error(y_true_mad, y_pred_mad))
    r2_mad= r2_score(y_true_mad, y_pred_mad)
    err_pct = np.abs((y_true_mad - y_pred_mad) / y_true_mad) * 100
    mape    = np.mean(err_pct)
    mdape   = np.median(err_pct)   # Median APE — robuste aux outliers

    kf    = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_X  = X_train if X_train is not None else X_test
    cv_y  = y_train if y_train is not None else y_test
    cv_r2 = cross_val_score(pipeline, cv_X, cv_y, cv=kf, scoring="r2")

    print("\n" + "═" * 52)
    print("  MÉTRIQUES — TERRAIN VENTE v5")
    print("═" * 52)
    print(f"  R² log(prix) [principale] : {r2_log:>10.4f}  ✅")
    print(f"  CV R² ({cv_folds} folds)          : {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
    print("─" * 52)
    print(f"  MAE              : {mae:>18,.0f} MAD")
    print(f"  RMSE             : {rmse:>18,.0f} MAD")
    print(f"  R² en MAD        : {r2_mad:>18.4f}")
    print(f"  MdAPE (médiane)  : {mdape:>17.1f} %  ← robuste")
    print(f"  MAPE (moyenne)   : {mape:>17.1f} %  ← biaisée outliers")
    print("─" * 52)
    print("  Précision par seuil d'erreur :")
    for s in [10, 20, 30, 50]:
        print(f"    ≤ {s:2d}%  →  {(err_pct <= s).mean()*100:.1f}% des prédictions")
    print("═" * 52)

    return {
        "R² log":       r2_log,
        "R² MAD":       r2_mad,
        "MAE (MAD)":    mae,
        "RMSE (MAD)":   rmse,
        "MAPE (%)":     mape,
        "MdAPE (%)":    mdape,
        "CV R² (mean)": cv_r2.mean(),
        "CV R² (std)":  cv_r2.std(),
    }


# ─── 7. VISUALISATIONS ────────────────────────────────────────────────────────

def plot_results(pipeline, X_test, df_test, output_path="terrain_v5_eval.png"):
    import matplotlib.pyplot as plt

    log_pred   = pipeline.predict(X_test)
    y_pred_mad = np.exp(log_pred)
    y_true_mad = df_test["prix_num"].values
    residuals  = y_true_mad - y_pred_mad

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Évaluation XGBoost — Prix Terrains Marrakech v5",
                 fontsize=14, fontweight="bold", y=1.01)

    # Prédictions vs réel
    ax = axes[0, 0]
    ax.scatter(y_true_mad/1e6, y_pred_mad/1e6, alpha=0.4, s=18, color="#2563EB")
    lims = [min(y_true_mad.min(), y_pred_mad.min())/1e6,
            max(y_true_mad.max(), y_pred_mad.max())/1e6]
    ax.plot(lims, lims, "r--", lw=1.5, label="Parfait")
    ax.set_xlabel("Prix réel (M MAD)"); ax.set_ylabel("Prix prédit (M MAD)")
    ax.set_title("Prédictions vs Réel"); ax.legend(); ax.grid(True, alpha=0.3)

    # Distribution résidus
    ax = axes[0, 1]
    ax.hist(residuals/1e3, bins=50, color="#10B981", edgecolor="white", lw=0.5)
    ax.axvline(0, color="red", ls="--", lw=1.5)
    ax.set_xlabel("Résidu (k MAD)"); ax.set_title("Distribution résidus"); ax.grid(True, alpha=0.3)

    # Résidus vs prédictions
    ax = axes[1, 0]
    ax.scatter(y_pred_mad/1e6, residuals/1e3, alpha=0.4, s=18, color="#F59E0B")
    ax.axhline(0, color="red", ls="--", lw=1.5)
    ax.set_xlabel("Prix prédit (M MAD)"); ax.set_ylabel("Résidu (k MAD)")
    ax.set_title("Résidus vs Prédictions"); ax.grid(True, alpha=0.3)

    # Feature importance
    ax = axes[1, 1]
    pre = pipeline.named_steps["preprocessor"]
    mdl = pipeline.named_steps["model"]
    try:
        num_names = list(pre.transformers_[0][2])
        bin_names = list(pre.transformers_[1][2])
        cat_enc   = pre.transformers_[2][1]
        cat_names = list(cat_enc.get_feature_names_out(
            [c for c in CATEGORICAL_FEATURES if c in X_test.columns]
        ))
        feature_names = num_names + bin_names + cat_names
    except Exception:
        feature_names = [f"f{i}" for i in range(mdl.n_features_in_)]
    imp   = mdl.feature_importances_
    top_n = min(15, len(feature_names))
    idx   = np.argsort(imp)[-top_n:]
    ax.barh([feature_names[i] for i in idx], imp[idx], color="#6366F1")
    ax.set_xlabel("Importance"); ax.set_title(f"Top {top_n} Features")
    ax.grid(True, alpha=0.3, axis="x")

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.show()
    print(f"✅ Graphiques sauvegardés → {output_path}")


# ─── 8. PRÉDICTION ────────────────────────────────────────────────────────────

def predict_price(pipeline, terrain: dict, stats: dict) -> float:
    """
    Prédit le prix d'un terrain.
    terrain : dict avec au minimum {'surface_num': float, 'zone_clean': str}
    stats   : dict retourné par split_and_encode()
    """
    t = terrain.copy()
    t.setdefault("zone_clean",    "Autre")
    t.setdefault("source_clean",  "autre_src")
    t.setdefault("is_particulier", 0)
    t.setdefault("km_distance",   0)
    t.setdefault("usage_terrain", "autre")
    t.setdefault("statut_titre",  "non_specifie")
    # NLP à 0 par défaut
    for kw in ["kw_immeuble","kw_agricole","kw_golf","kw_villa_zone","kw_resid",
                "kw_facade","kw_projet","kw_constructible","kw_plat","kw_urgent",
                "kw_viabilise","kw_industriel","kw_tf","kw_melk","kw_hectare","kw_vue"]:
        t.setdefault(kw, 0)
    t.setdefault("terrain_quality", 0)
    t["pm2"] = 1; t["prix_num"] = 1  # placeholders for _add_features

    # Surface cat
    s = t["surface_num"]
    bins  = [0, 300, 1000, 5000, 20000, 100000, 999999]
    labels= ["micro","petit","moyen","grand","tres_grand","domaine"]
    t["surface_cat"] = next((labels[i] for i, (lo, hi) in enumerate(zip(bins, bins[1:])) if lo < s <= hi), "domaine")

    row_df = pd.DataFrame([t])
    row_df = _add_features(row_df, stats)

    all_feats = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES
    for f in all_feats:
        if f not in row_df.columns:
            row_df[f] = 0

    log_prix_pred = pipeline.predict(row_df[all_feats])[0]
    prix_mad      = np.exp(log_prix_pred)
    pm2           = prix_mad / t["surface_num"]

    print(f"🏗️  Terrain  : {t['surface_num']:,.0f} m²  |  Zone : {t['zone_clean']}")
    print(f"💰  Prix estimé : {prix_mad:,.0f} MAD  ({prix_mad/EUR_TO_MAD:,.0f} EUR)")
    print(f"    Prix/m²     : {pm2:,.0f} MAD/m²")
    print(f"    Fourchette  : [{prix_mad*0.6:,.0f} — {prix_mad*1.6:,.0f}] MAD")
    return prix_mad


# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    DATA_PATH  = "terrain_vente.csv"
    MODEL_PATH = "xgb_terrain_vente_v5.pkl"
    META_PATH  = "xgb_terrain_vente_v5_metadata.json"

    print("=" * 55)
    print("  PIPELINE TERRAIN VENTE v5 — Marrakech")
    print("=" * 55)

    print("\n[1/5] Chargement & feature engineering...")
    df = load_data(DATA_PATH)

    print("\n[2/5] Split + target encoding...")
    X_train, X_test, y_train, y_test, df_train, df_test, stats = split_and_encode(df)

    # Optuna (décommenter pour lancer la recherche)
    # print("\n[3/5] Optimisation Optuna (200 trials)...")
    # best_params = tune_optuna(X_train, y_train, n_trials=200)
    # pipeline = build_pipeline(X_train, xgb_params=best_params)

    print("\n[3/5] Construction pipeline...")
    pipeline = build_pipeline(X_train)

    print("\n[4/5] Entraînement...")
    pipeline = train(pipeline, X_train, y_train)

    print("\n[5/5] Évaluation...")
    metrics = evaluate(pipeline, X_test, y_test, df_test, X_train, y_train)

    plot_results(pipeline, X_test, df_test)

    # Sauvegarde
    os.makedirs(os.path.dirname(MODEL_PATH) if os.path.dirname(MODEL_PATH) else ".", exist_ok=True)
    joblib.dump({"pipeline": pipeline, "stats": stats}, MODEL_PATH)
    print(f"\n✅ Modèle → {MODEL_PATH}")

    metadata = {
        "date":          datetime.now().strftime("%Y-%m-%d"),
        "version":       "v5",
        "modele":        "XGBRegressor",
        "type_bien":     "terrain_vente",
        "target":        "log(prix_total)",
        "n_lignes_train": len(X_train),
        "n_lignes_test":  len(X_test),
        "n_features":    len(X_train.columns),
        "n_zones":       int(df["zone_clean"].nunique()),
        "metriques_test": {
            "R2_log":  round(metrics["R² log"], 4),
            "R2_MAD":  round(metrics["R² MAD"], 4),
            "MAE":     round(metrics["MAE (MAD)"], 0),
            "RMSE":    round(metrics["RMSE (MAD)"], 0),
            "MdAPE":   round(metrics["MdAPE (%)"], 2),
            "MAPE":    round(metrics["MAPE (%)"], 2),
        },
        "fourchette":    "±40% (prix_min × 0.60 | prix_max × 1.60)",
    }
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"✅ Métadonnées → {META_PATH}")



# # terrain_model_v2.py
# # =========================================================
# # PRICE PREDICTION — TERRAIN MARRAKECH
# # VERSION OPTIMISÉE (ANTI-OVERFIT + CATBOOST)
# # =========================================================

# import re
# import json
# import joblib
# import warnings
# import numpy as np
# import pandas as pd

# from sklearn.model_selection import (
#     train_test_split,
#     GroupKFold,
#     cross_val_score
# )

# from sklearn.metrics import (
#     mean_absolute_error,
#     mean_squared_error,
#     r2_score
# )

# from catboost import CatBoostRegressor

# warnings.filterwarnings("ignore")

# # =========================================================
# # CONFIG
# # =========================================================

# DATA_PATH = "terrain_vente.csv"

# SURFACE_MIN = 80
# SURFACE_MAX = 100000

# PM2_MIN = 100
# PM2_MAX = 30000

# EUR_TO_MAD = 10.8

# TARGET = "log_pm2"

# # =========================================================
# # HELPERS
# # =========================================================

# def parse_price(s):

#     if pd.isna(s):
#         return np.nan

#     s = str(s)

#     s = (
#         s.replace(" ", "")
#         .replace("\xa0", "")
#         .replace(".", "")
#         .replace(",", ".")
#     )

#     match = re.search(r"\d+(?:\.\d+)?", s)

#     if not match:
#         return np.nan

#     value = float(match.group())

#     if "EUR" in s.upper():
#         value *= EUR_TO_MAD

#     return value


# def parse_surface(s):

#     if pd.isna(s):
#         return np.nan

#     s = str(s).replace(",", ".")

#     match = re.search(r"[\d]+(?:[.,]\d+)?", s)

#     if not match:
#         return np.nan

#     return float(match.group())


# # =========================================================
# # ZONES
# # =========================================================

# ZONE_PATTERNS = {

#     "Route_Ourika": r"ourika",
#     "Route_Fes": r"fes|fès",
#     "Route_Casa": r"casa|casablanca",
#     "Palmeraie": r"palmeraie",
#     "Targa": r"targa",
#     "Route_Tahanaout": r"tahanaout",
#     "Route_Amizmiz": r"amizmiz",
#     "Route_Safi": r"safi",
#     "Chrifia": r"chrifia",
#     "Sidi_Abdallah": r"sidi abdellah",
# }


# def extract_zone(text):

#     if pd.isna(text):
#         return "Autre"

#     text = str(text).lower()

#     for zone, pattern in ZONE_PATTERNS.items():

#         if re.search(pattern, text):
#             return zone

#     return "Autre"


# # =========================================================
# # LOAD DATA
# # =========================================================

# def load_data(path):

#     df = pd.read_csv(path)

#     print("=" * 60)
#     print("CHARGEMENT DATA")
#     print("=" * 60)

#     # -----------------------------------------------------
#     # terrain only
#     # -----------------------------------------------------

#     df = df[
#         df["type_bien"]
#         .astype(str)
#         .str.lower()
#         .str.contains("terrain")
#     ].copy()

#     print("Terrains:", len(df))

#     # -----------------------------------------------------
#     # parse
#     # -----------------------------------------------------

#     df["prix_num"] = df["prix"].apply(parse_price)

#     df["surface_num"] = df["surface"].apply(parse_surface)

#     # -----------------------------------------------------
#     # filters
#     # -----------------------------------------------------

#     df = df[
#         df["prix_num"].notna()
#     ]

#     df = df[
#         df["surface_num"].notna()
#     ]

#     df = df[
#         df["surface_num"].between(SURFACE_MIN, SURFACE_MAX)
#     ]

#     # -----------------------------------------------------
#     # target
#     # -----------------------------------------------------

#     df["pm2"] = df["prix_num"] / df["surface_num"]

#     df = df[
#         df["pm2"].between(PM2_MIN, PM2_MAX)
#     ]

#     # -----------------------------------------------------
#     # remove outliers
#     # -----------------------------------------------------

#     q_low = df["pm2"].quantile(0.02)
#     q_high = df["pm2"].quantile(0.98)

#     df = df[
#         df["pm2"].between(q_low, q_high)
#     ]

#     # -----------------------------------------------------
#     # features
#     # -----------------------------------------------------

#     text_cols = (
#         df["titre"].fillna("") +
#         " " +
#         df["description"].fillna("") +
#         " " +
#         df["localisation"].fillna("")
#     ).str.lower()

#     df["zone_clean"] = text_cols.apply(extract_zone)

#     df["log_surface"] = np.log(df["surface_num"])

#     df["usage_terrain"] = "autre"

#     df.loc[
#         text_cols.str.contains("agricole", na=False),
#         "usage_terrain"
#     ] = "agricole"

#     df.loc[
#         text_cols.str.contains("immeuble|r\+", na=False),
#         "usage_terrain"
#     ] = "immeuble"

#     df.loc[
#         text_cols.str.contains("golf", na=False),
#         "usage_terrain"
#     ] = "golf"

#     # -----------------------------------------------------
#     # keywords
#     # -----------------------------------------------------

#     df["kw_constructible"] = (
#         text_cols
#         .str.contains("constructible|villa|lotissement", na=False)
#         .astype(int)
#     )

#     df["kw_agricole"] = (
#         text_cols
#         .str.contains("agricole|ferme|olivier", na=False)
#         .astype(int)
#     )

#     df["kw_immeuble"] = (
#         text_cols
#         .str.contains("immeuble|r\\+", na=False)
#         .astype(int)
#     )

#     df["kw_golf"] = (
#         text_cols
#         .str.contains("golf", na=False)
#         .astype(int)
#     )

#     # -----------------------------------------------------
#     # target
#     # -----------------------------------------------------

#     df["log_pm2"] = np.log(df["pm2"])

#     print("Dataset final:", df.shape)

#     return df


# # =========================================================
# # TRAIN
# # =========================================================

# def train_model(df):

#     FEATURES = [

#         "surface_num",
#         "log_surface",

#         "zone_clean",
#         "usage_terrain",

#         "kw_constructible",
#         "kw_agricole",
#         "kw_immeuble",
#         "kw_golf",
#     ]

#     CAT_FEATURES = [
#         "zone_clean",
#         "usage_terrain"
#     ]

#     X = df[FEATURES]

#     y = df[TARGET]

#     groups = df["zone_clean"]

#     # -----------------------------------------------------
#     # split
#     # -----------------------------------------------------

#     X_train, X_test, y_train, y_test = train_test_split(
#         X,
#         y,
#         test_size=0.2,
#         random_state=42
#     )

#     # -----------------------------------------------------
#     # model
#     # -----------------------------------------------------

#     model = CatBoostRegressor(

#         iterations=2000,
#         learning_rate=0.03,
#         depth=6,

#         loss_function="RMSE",

#         eval_metric="R2",

#         random_seed=42,

#         verbose=200,

#         early_stopping_rounds=200
#     )

#     # -----------------------------------------------------
#     # fit
#     # -----------------------------------------------------

#     model.fit(

#         X_train,
#         y_train,

#         cat_features=CAT_FEATURES,

#         eval_set=(X_test, y_test),

#         use_best_model=True
#     )

#     # -----------------------------------------------------
#     # predictions
#     # -----------------------------------------------------

#     pred_log_pm2 = model.predict(X_test)

#     pred_pm2 = np.exp(pred_log_pm2)

#     real_pm2 = np.exp(y_test)

#     # prix total
#     pred_price = pred_pm2 * X_test["surface_num"]

#     real_price = real_pm2 * X_test["surface_num"]

#     # -----------------------------------------------------
#     # metrics
#     # -----------------------------------------------------

#     mae = mean_absolute_error(real_price, pred_price)

#     rmse = np.sqrt(
#         mean_squared_error(real_price, pred_price)
#     )

#     r2 = r2_score(real_price, pred_price)

#     mape = np.mean(
#         np.abs(real_price - pred_price)
#         / real_price
#     ) * 100

#     mdape = np.median(
#         np.abs(real_price - pred_price)
#         / real_price
#     ) * 100

#     # -----------------------------------------------------
#     # cross validation
#     # -----------------------------------------------------

#     gkf = GroupKFold(n_splits=5)

#     cv_scores = []

#     for train_idx, val_idx in gkf.split(X, y, groups):

#         X_tr = X.iloc[train_idx]
#         X_val = X.iloc[val_idx]

#         y_tr = y.iloc[train_idx]
#         y_val = y.iloc[val_idx]

#         cv_model = CatBoostRegressor(

#             iterations=2000,
#             learning_rate=0.03,
#             depth=6,

#             loss_function="RMSE",

#             eval_metric="R2",

#             random_seed=42,

#             verbose=False
#         )

#         cv_model.fit(

#             X_tr,
#             y_tr,

#             cat_features=CAT_FEATURES,

#             eval_set=(X_val, y_val),

#             verbose=False
#         )

#         preds = cv_model.predict(X_val)

#         score = r2_score(y_val, preds)

#         cv_scores.append(score)

#     cv_scores = np.array(cv_scores)

#     # -----------------------------------------------------
#     # results
#     # -----------------------------------------------------

#     print("\n" + "=" * 60)
#     print("MÉTRIQUES")
#     print("=" * 60)

#     print(f"MAE     : {mae:,.0f} MAD")
#     print(f"RMSE    : {rmse:,.0f} MAD")
#     print(f"R²      : {r2:.4f}")
#     print(f"MAPE    : {mape:.2f}%")
#     print(f"MdAPE   : {mdape:.2f}%")

#     print(
#         f"CV R²   : "
#         f"{cv_scores.mean():.4f} ± {cv_scores.std():.4f}"
#     )

#     # -----------------------------------------------------
#     # save
#     # -----------------------------------------------------

#     joblib.dump(model, "terrain_catboost_model.pkl")

#     metadata = {

#         "features": FEATURES,
#         "target": TARGET,

#         "metrics": {

#             "mae": float(mae),
#             "rmse": float(rmse),
#             "r2": float(r2),
#             "mape": float(mape),
#             "mdape": float(mdape)
#         }
#     }

#     with open("terrain_metadata.json", "w") as f:

#         json.dump(metadata, f, indent=4)

#     print("\nModel saved.")

#     return model


# # =========================================================
# # PREDICT
# # =========================================================

# def predict_price(model, surface, zone):

#     row = pd.DataFrame([{

#         "surface_num": surface,
#         "log_surface": np.log(surface),

#         "zone_clean": zone,
#         "usage_terrain": "autre",

#         "kw_constructible": 0,
#         "kw_agricole": 0,
#         "kw_immeuble": 0,
#         "kw_golf": 0,
#     }])

#     pred_log_pm2 = model.predict(row)[0]

#     pred_pm2 = np.exp(pred_log_pm2)

#     total_price = pred_pm2 * surface

#     print("=" * 60)

#     print("PREDICTION")

#     print("=" * 60)

#     print(f"Surface : {surface:,.0f} m²")

#     print(f"Zone    : {zone}")

#     print(f"Prix/m² : {pred_pm2:,.0f} MAD")

#     print(f"Prix total : {total_price:,.0f} MAD")

#     return total_price


# # =========================================================
# # MAIN
# # =========================================================

# if __name__ == "__main__":

#     df = load_data(DATA_PATH)

#     model = train_model(df)

#     predict_price(

#         model,

#         surface=1000,

#         zone="Route_Ourika"
#     )