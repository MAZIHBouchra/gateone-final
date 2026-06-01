"""
pip_locaux.py — Pipeline de prédiction prix locaux commerciaux Marrakech
Améliorations v2 :
  - Fix bug zone Guéliz/Guéliz (normalisation accents)
  - CV sur X_train uniquement (pas de data leakage)
  - Target : log(prix_total) au lieu de log(pm²) [corrélation surface plus forte]
  - Interaction surface × type_local
  - Fallback fourchette ±35% si R² < 0.55 (plafond données comme terrains)
"""

import re
import unicodedata
import warnings
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import optuna
from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_absolute_percentage_error
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")
optuna.logging.set_verbosity(optuna.logging.WARNING)

# ─────────────────────────────────────────────
# CHEMINS
# ─────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
DATA_PATH  = BASE_DIR / "notebooks/ventes/locaux_vente_cleaned.csv"
MODEL_PATH = BASE_DIR / "model_training/models/xgb_locaux_vente.pkl"

# ─────────────────────────────────────────────
# CONSTANTES EXPORTÉES (importables depuis le notebook)
# ─────────────────────────────────────────────

TARGET_LOG = "log_prix_total"

NUMERIC_FEATURES = [
    "log_surface", "log_surface_sq",
    "te_lpt_zone", "te_lpt_std",
    "prix_median_zone", "prix_moy_zone", "nb_listings_zone",
    "ratio_pm2_city", "surface_relative", "score_local",
    "surf_x_type",
    "etage",
]

BINARY_FEATURES = [
    "parking", "ascenseur", "climatisation", "securite", "vue", "neuf",
    "is_particulier",
    "kw_bureau", "kw_depot", "kw_industriel", "kw_salle",
    "kw_angle", "kw_hotel", "kw_titre", "kw_renove", "kw_urgent",
]

CATEGORICAL_FEATURES = ["zone_clean", "source_clean", "type_local"]

# ─────────────────────────────────────────────
# 1. UTILITAIRES
# ─────────────────────────────────────────────

def normalize_text(s: str) -> str:
    """Supprime les accents et met en minuscules — fix Guéliz vs Guéliz."""
    if not isinstance(s, str):
        return s
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_str = nfkd.encode("ascii", "ignore").decode("ascii")
    return ascii_str.strip().lower()


def extract_keywords(text: str) -> dict:
    """Extrait des mots-clés métier depuis le titre/description."""
    text = str(text).lower()
    return {
        "kw_bureau":      int(bool(re.search(r"bureau", text))),
        "kw_depot":       int(bool(re.search(r"d[eé]p[oô]t|entrepôt|entrepot|stock", text))),
        "kw_industriel":  int(bool(re.search(r"industriel|usine|atelier|hangar", text))),
        "kw_salle":       int(bool(re.search(r"salle|réception|reception|fête|fete|événement", text))),
        "kw_angle":       int(bool(re.search(r"angle|corner", text))),
        "kw_hotel":       int(bool(re.search(r"h[oô]tel|riad", text))),
        "kw_titre":       int(bool(re.search(r"titre foncier|tf\b", text))),
        "kw_renove":      int(bool(re.search(r"rénov|renov|refait|neuf|récent", text))),
        "kw_urgent":      int(bool(re.search(r"urgent|vite|opportunit", text))),
    }


def infer_type_local(row: pd.Series) -> str:
    """Infère le type_local depuis les keywords si manquant."""
    if pd.notna(row.get("type_local")) and str(row["type_local"]).strip():
        return str(row["type_local"]).strip()
    if row.get("kw_bureau"):     return "bureau"
    if row.get("kw_depot"):      return "depot"
    if row.get("kw_industriel"): return "industriel"
    if row.get("kw_hotel"):      return "hotel_riad"
    if row.get("kw_salle"):      return "salle"
    return "local_comm"

# ─────────────────────────────────────────────
# 2. CHARGEMENT & NETTOYAGE
# ─────────────────────────────────────────────

def load_data(path: Path = DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f"✅ Chargement : {len(df)} lignes, {df.shape[1]} colonnes")

    # --- Construction zone_clean ---
    # Le CSV brut peut avoir "quartier", "localisation" ou déjà "zone_clean"
    if "zone_clean" not in df.columns:
        if "quartier" in df.columns and df["quartier"].notna().sum() > len(df) * 0.3:
            df["zone_clean"] = df["quartier"].fillna("inconnu")
        elif "localisation" in df.columns:
            df["zone_clean"] = df["localisation"].fillna("inconnu")
        else:
            df["zone_clean"] = "inconnu"
    df["zone_clean"] = df["zone_clean"].apply(normalize_text)
    n_zones = df["zone_clean"].nunique()
    print(f"   Zones après normalisation accents : {n_zones}")

    # --- Nettoyage surface ---
    # surface_num = colonne nettoyée ; surface = texte brut
    surf_col = next(
        (c for c in ["surface_num", "surface", "superficie"]
         if c in df.columns and pd.to_numeric(df[c], errors="coerce").notna().sum() > len(df) * 0.3),
        None
    )
    if surf_col is None:
        raise ValueError(f"Aucune colonne surface valide. Colonnes dispo : {df.columns.tolist()}")
    print(f"   Colonne surface utilisée : '{surf_col}'")
    df["surface_num"] = pd.to_numeric(df[surf_col], errors="coerce")
    # Max 10 000 m² pour couvrir entrepôts / locaux industriels
    df = df[df["surface_num"].between(5, 10_000)].copy()

    # --- Nettoyage prix ---
    # prix_num = colonne nettoyée par le notebook ; "prix" = texte brut souvent vide
    price_col = next(
        (c for c in ["prix_num", "prix_total", "prix"]
         if c in df.columns and pd.to_numeric(df[c], errors="coerce").notna().sum() > len(df) * 0.3),
        None
    )
    if price_col is None:
        raise ValueError(f"Aucune colonne prix valide. Colonnes dispo : {df.columns.tolist()}")
    print(f"   Colonne prix utilisée : '{{price_col}}'")
    df["prix_total"] = pd.to_numeric(df[price_col], errors="coerce")
    df = df[df["prix_total"].between(50_000, 50_000_000)].copy()

    # --- Prix/m² ---
    df["prix_m2"] = df["prix_total"] / df["surface_num"]  # recalcul propre même si colonne existe
    df = df[df["prix_m2"].between(1_000, 200_000)].copy()

    # --- Keywords NLP ---
    text_col = "titre" if "titre" in df.columns else "description" if "description" in df.columns else None
    if text_col:
        kw_df = df[text_col].fillna("").apply(extract_keywords).apply(pd.Series)
        for col in kw_df.columns:
            df[col] = kw_df[col].values

    # --- Type local ---
    # Priorité 1 : colonne type_bien du CSV brut (mapping direct)
    TYPE_BIEN_MAP = {
        "bureau":          "bureau",
        "bureaux":         "bureau",
        "local commercial":"local_comm",
        "local":           "local_comm",
        "commerce":        "local_comm",
        "magasin":         "local_comm",
        "boutique":        "local_comm",
        "entrepot":        "depot",
        "entrepôt":        "depot",
        "depot":           "depot",
        "dépôt":           "depot",
        "hangar":          "depot",
        "industriel":      "industriel",
        "usine":           "industriel",
        "atelier":         "industriel",
        "salle":           "salle",
        "salle des fetes":  "salle",
        "salle de fête":    "salle",
        "hotel":           "hotel_riad",
        "riad":            "hotel_riad",
    }
    if "type_bien" in df.columns:
        mapped = (df["type_bien"].fillna("")
                    .str.lower().str.strip()
                    .map(TYPE_BIEN_MAP))
        # Là où type_bien est connu → on l'utilise ; sinon → infer_type_local
        df["type_local"] = mapped.where(mapped.notna(), df.apply(infer_type_local, axis=1))
    else:
        df["type_local"] = df.apply(infer_type_local, axis=1)
    print(f"   type_local distribution :")
    print(df["type_local"].value_counts().to_string())

    # --- Features dérivées ---
    df["log_surface"]    = np.log1p(df["surface_num"])
    df["log_surface_sq"] = df["log_surface"] ** 2
    df["log_prix_total"] = np.log(df["prix_total"])   # TARGET v2
    df["log_prix"]       = df["log_prix_total"]          # alias pour le notebook

    # --- Source ---
    if "source" in df.columns and df["source"].notna().sum() > 0:
        df["source_clean"] = df["source"].fillna("inconnu").str.lower().str.strip()
    elif "agence" in df.columns and df["agence"].notna().sum() > 0:
        df["source_clean"] = df["agence"].fillna("inconnu").str.lower().str.strip()
        df["source_clean"] = df["source_clean"].apply(lambda x: "particulier" if x in ("","inconnu","nan") else "agence")
    else:
        df["source_clean"] = "inconnu"

    if "is_particulier" not in df.columns:
        df["is_particulier"] = 0

    # --- Étage ---
    if "etage" not in df.columns:
        df["etage"] = 0
    df["etage"] = pd.to_numeric(df["etage"], errors="coerce").fillna(0).clip(0, 20)

    # --- Équipements binaires ---
    for col in ["parking", "ascenseur", "climatisation", "securite", "vue", "neuf"]:
        if col not in df.columns:
            df[col] = 0
        df[col] = df[col].fillna(0).astype(int)

    print(f"   Après nettoyage : {len(df)} lignes")
    print(f"   Prix/m² médian  : {df['prix_m2'].median():,.0f} MAD/m²")
    print(f"   Surface médiane : {df['surface_num'].median():.0f} m²")
    return df

# ─────────────────────────────────────────────
# 3. FEATURE ENGINEERING & TARGET ENCODING
# ─────────────────────────────────────────────

def build_features(df: pd.DataFrame, stats: dict = None, is_train: bool = True) -> tuple:
    """
    Construit les features finales.
    stats : dictionnaire de stats d'encodage (calculé sur train, appliqué sur test).
    Retourne (X, stats).
    """
    data = df.copy()

    # ── Target encoding zone (sans leakage : calculé sur train) ──
    if is_train:
        zone_stats = (
            data.groupby("zone_clean")["log_prix_total"]
            .agg(["mean", "std", "count"])
            .rename(columns={"mean": "te_lpt_zone", "std": "te_lpt_std", "count": "nb_listings_zone"})
        )
        # prix médian zone
        zone_median = data.groupby("zone_clean")["prix_total"].median().rename("prix_median_zone")
        zone_mean   = data.groupby("zone_clean")["prix_total"].mean().rename("prix_moy_zone")
        zone_stats  = zone_stats.join(zone_median).join(zone_mean)

        global_mean = data["log_prix_total"].mean()
        global_std  = data["log_prix_total"].std()
        city_median = data["prix_total"].median()

        stats = {
            "zone_stats":   zone_stats,
            "global_mean":  global_mean,
            "global_std":   global_std,
            "city_median":  city_median,
        }
    else:
        assert stats is not None, "stats requis pour is_train=False"
        zone_stats  = stats["zone_stats"]
        global_mean = stats["global_mean"]
        city_median = stats["city_median"]

    # Merge zone stats
    data = data.merge(zone_stats.reset_index(), on="zone_clean", how="left")
    data["te_lpt_zone"]       = data["te_lpt_zone"].fillna(global_mean)
    data["te_lpt_std"]        = data["te_lpt_std"].fillna(data["te_lpt_std"].median() if is_train else 0.5)
    data["nb_listings_zone"]  = data["nb_listings_zone"].fillna(1)
    data["prix_median_zone"]  = data["prix_median_zone"].fillna(city_median)
    data["prix_moy_zone"]     = data["prix_moy_zone"].fillna(city_median)

    # ── Interaction surface × type_local ──
    type_surface_stats = {}
    if is_train:
        type_surface_stats = (
            data.groupby("type_local")["log_surface"]
            .agg(["mean", "std"])
            .rename(columns={"mean": "ts_log_surf_mean", "std": "ts_log_surf_std"})
        )
        stats["type_surface_stats"] = type_surface_stats
    else:
        type_surface_stats = stats.get("type_surface_stats", pd.DataFrame())

    if len(type_surface_stats):
        data = data.merge(type_surface_stats.reset_index(), on="type_local", how="left")
        data["ts_log_surf_mean"] = data["ts_log_surf_mean"].fillna(data["log_surface"].mean())
        data["ts_log_surf_std"]  = data["ts_log_surf_std"].fillna(0.5)
    else:
        data["ts_log_surf_mean"] = data["log_surface"].mean()
        data["ts_log_surf_std"]  = 0.5

    # Interaction feature : écart de surface par rapport à la moyenne du type
    data["surf_x_type"] = (data["log_surface"] - data["ts_log_surf_mean"]) / (data["ts_log_surf_std"] + 1e-6)

    # Ratio pm² vs ville
    data["ratio_pm2_city"] = data["prix_m2"] / (city_median / data["surface_num"].median())

    # Surface relative dans la zone
    zone_surf = data.groupby("zone_clean")["surface_num"].transform("median")
    data["surface_relative"] = data["surface_num"] / zone_surf.replace(0, np.nan).fillna(data["surface_num"].median())

    # Score local composite
    bonus_cols = ["parking", "climatisation", "securite", "vue", "neuf"]
    data["score_local"] = data[[c for c in bonus_cols if c in data.columns]].sum(axis=1)

    # ── Sélection des features finales (références aux constantes module) ──
    available = lambda cols: [c for c in cols if c in data.columns]
    feature_cols = available(NUMERIC_FEATURES) + available(BINARY_FEATURES) + available(CATEGORICAL_FEATURES)

    X = data[feature_cols].copy()
    for c in available(BINARY_FEATURES):
        X[c] = X[c].fillna(0).astype(int)
    for c in available(NUMERIC_FEATURES):
        X[c] = X[c].fillna(X[c].median())

    stats["feature_cols"]     = feature_cols
    stats["numeric_cols"]     = available(NUMERIC_FEATURES)
    stats["binary_cols"]      = available(BINARY_FEATURES)
    stats["categorical_cols"] = available(CATEGORICAL_FEATURES)

    return X, stats


def split_and_encode(df: pd.DataFrame, test_size: float = 0.2, seed: int = 42, random_state: int = None):
    seed = random_state if random_state is not None else seed
    train_df, test_df = train_test_split(df, test_size=test_size, random_state=seed)
    print(f"   Train : {len(train_df)} | Test : {len(test_df)}")

    X_train, stats = build_features(train_df, is_train=True)
    y_train = train_df["log_prix_total"].values

    X_test, _    = build_features(test_df, stats=stats, is_train=False)
    y_test        = test_df["log_prix_total"].values

    return X_train, X_test, y_train, y_test, train_df, test_df, stats

# ─────────────────────────────────────────────
# 4. CONSTRUCTION DU PIPELINE SKLEARN
# ─────────────────────────────────────────────

def build_pipeline(stats_or_X, xgb_params: dict = None) -> Pipeline:
    """Accepte stats (dict) ou X_train (DataFrame) — compatibilité notebook."""
    if isinstance(stats_or_X, dict):
        stats = stats_or_X
        num_cols = stats["numeric_cols"] + stats["binary_cols"]
        cat_cols = stats["categorical_cols"]
    else:
        # X_train passé directement : inférer les colonnes depuis le DataFrame
        X = stats_or_X
        cat_cols = [c for c in CATEGORICAL_FEATURES if c in X.columns]
        num_cols = [c for c in NUMERIC_FEATURES + BINARY_FEATURES if c in X.columns]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
        ],
        remainder="drop",
    )

    if xgb_params is None:
        xgb_params = {
            "n_estimators":     300,
            "max_depth":        4,
            "learning_rate":    0.05,
            "subsample":        0.8,
            "colsample_bytree": 0.8,
            "min_child_weight": 5,
            "reg_alpha":        0.1,
            "reg_lambda":       1.0,
            "random_state":     42,
            "n_jobs":           -1,
        }

    model = XGBRegressor(**xgb_params)
    pipeline = Pipeline([("preprocessor", preprocessor), ("model", model)])
    return pipeline

# ─────────────────────────────────────────────
# 5. OPTUNA — TUNING HYPERPARAMÈTRES
# ─────────────────────────────────────────────

def tune_hyperparams(X_train: pd.DataFrame, y_train: np.ndarray, stats: dict, n_trials: int = 40) -> dict:
    """Optimise XGBoost sur X_train via CV 5-fold (pas de data leakage)."""
    print("🔍 Tuning hyperparamètres sur X_train (CV 5-fold)...")

    def objective(trial):
        params = {
            "n_estimators":     trial.suggest_int("n_estimators", 100, 600),
            "max_depth":        trial.suggest_int("max_depth", 3, 7),
            "learning_rate":    trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
            "subsample":        trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
            "min_child_weight": trial.suggest_int("min_child_weight", 3, 15),
            "reg_alpha":        trial.suggest_float("reg_alpha", 0.0, 2.0),
            "reg_lambda":       trial.suggest_float("reg_lambda", 0.5, 5.0),
            "random_state":     42,
            "n_jobs":           -1,
        }
        pipe = build_pipeline(stats, params)
        # CV sur TRAIN uniquement (fix data leakage)
        cv = KFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="r2", n_jobs=-1)
        return scores.mean()

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)

    best = study.best_params
    print(f"   Meilleur CV R² (train) : {study.best_value:.3f}")
    print(f"   Params : {best}")
    return best

# ─────────────────────────────────────────────
# 6. ENTRAÎNEMENT
# ─────────────────────────────────────────────

def train(pipeline: Pipeline, X_train: pd.DataFrame, y_train: np.ndarray) -> Pipeline:
    print("🚀 Entraînement...")
    pipeline.fit(X_train, y_train)
    return pipeline

# ─────────────────────────────────────────────
# 7. ÉVALUATION
# ─────────────────────────────────────────────

def evaluate(pipeline: Pipeline, X_train_or_Xtest, X_test_or_ytest, y_train_or_dftest=None, y_test=None, df_test: pd.DataFrame = None):
    """
    Métriques en log_prix_total → back-transform exp() → prix MAD réels.
    Accepte deux signatures :
      - evaluate(pipeline, X_train, X_test, y_train, y_test)   ← 5 args
      - evaluate(pipeline, X_test,  y_test, df_test)            ← 3 args (notebook)
    """
    # Détection de la signature appelée
    if y_test is None:
        # Appelé avec 3 args : (pipeline, X_test, y_test, df_test)
        X_test   = X_train_or_Xtest
        y_test   = X_test_or_ytest
        df_test  = y_train_or_dftest
        X_train  = None
        y_train  = None
    else:
        X_train  = X_train_or_Xtest
        X_test   = X_test_or_ytest
        y_train  = y_train_or_dftest

    # Prédictions log scale
    y_pred_test  = pipeline.predict(X_test)
    y_pred_train = pipeline.predict(X_train) if X_train is not None else None

    # R² en log scale
    r2_train = r2_score(y_train, y_pred_train) if y_train is not None else float("nan")
    r2_test  = r2_score(y_test,  y_pred_test)

    # Back-transform → prix MAD
    prix_reel  = np.exp(y_test)
    prix_pred  = np.exp(y_pred_test)

    mape = mean_absolute_percentage_error(prix_reel, prix_pred) * 100
    mad  = np.median(np.abs(prix_pred - prix_reel))
    median_prix = np.median(prix_reel)

    print("\n" + "=" * 50)
    print("📊 RÉSULTATS LOCAUX COMMERCIAUX")
    print("=" * 50)
    print(f"  R² train        : {r2_train:.3f}")
    print(f"  R² test         : {r2_test:.3f}")
    print(f"  MAPE            : {mape:.1f}%")
    print(f"  MAD prix        : {mad:,.0f} MAD  (médian {median_prix:,.0f})")

    # CV sur train (5-fold) — seulement si X_train disponible
    if X_train is not None:
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="r2")
        print(f"  CV R² (train)   : {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
    else:
        cv_scores = type("cv", (), {"mean": lambda s: float("nan"), "std": lambda s: float("nan")})()

    # Verdict qualité
    if r2_test >= 0.55:
        print("\n  ✅ Modèle utilisable — prédiction ponctuelle")
        mode = "point"
    else:
        print("\n  ⚠️  R² < 0.55 — plafond données atteint (comme terrains)")
        print("     → Mode FOURCHETTE ±35% activé")
        mode = "range"

    return {
        # clés snake_case (pipeline interne)
        "r2_train":  r2_train,
        "r2_test":   r2_test,
        "mape":      mape,
        "mad":       mad,
        "cv_mean":   cv_scores.mean() if X_train is not None else float("nan"),
        "cv_std":    cv_scores.std()  if X_train is not None else float("nan"),
        "mode":      mode,
        # alias notebook (R², MAPE (%), MAD, MAE, RMSE)
        "R²":        r2_test,
        "MAPE (%)":  mape,
        "MAD":       mad,
        "MAE (MAD)": float(np.mean(np.abs(prix_pred - prix_reel))),
        "RMSE (MAD)": float(np.sqrt(np.mean((prix_pred - prix_reel) ** 2))),
    }

# ─────────────────────────────────────────────
# 8. GRAPHIQUES
# ─────────────────────────────────────────────

def plot_results(pipeline, X_test, y_test_or_dftest=None, metrics: dict = None, save_dir: Path = None):
    # Détection signature : 3 args (pipeline, X_test, df_test) ou 4 args (pipeline, X_test, y_test, metrics)
    if isinstance(y_test_or_dftest, pd.DataFrame):
        # appelé comme plot_results(pipeline, X_test, df_test)
        df_plot  = y_test_or_dftest
        prix_pred = np.exp(pipeline.predict(X_test))
        prix_reel = df_plot["prix_num"].values if "prix_num" in df_plot.columns else df_plot["prix_total"].values
        if metrics is None:
            metrics = {"r2_test": r2_score(np.log(prix_reel), pipeline.predict(X_test)),
                       "mape": mean_absolute_percentage_error(prix_reel, prix_pred) * 100}
    else:
        # appelé comme plot_results(pipeline, X_test, y_test, metrics)
        y_test    = y_test_or_dftest
        prix_reel = np.exp(y_test)
        prix_pred = np.exp(pipeline.predict(X_test))
        if metrics is None:
            metrics = {"r2_test": r2_score(y_test, pipeline.predict(X_test)),
                       "mape": mean_absolute_percentage_error(prix_reel, prix_pred) * 100}
    residuals = prix_pred - prix_reel
    pct_errors = (prix_pred - prix_reel) / prix_reel * 100

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(
        f"Locaux Commerciaux — R²={metrics['r2_test']:.2f} | MAPE={metrics['mape']:.1f}%",
        fontsize=14, fontweight="bold"
    )

    # 1. Réel vs Prédit
    ax = axes[0, 0]
    ax.scatter(prix_reel / 1e6, prix_pred / 1e6, alpha=0.5, s=20, color="#2563eb")
    lim = max(prix_reel.max(), prix_pred.max()) / 1e6 * 1.05
    ax.plot([0, lim], [0, lim], "r--", lw=1.5, label="Parfait")
    ax.set_xlabel("Prix réel (M MAD)")
    ax.set_ylabel("Prix prédit (M MAD)")
    ax.set_title("Réel vs Prédit")
    ax.legend()

    # 2. Distribution % erreur
    ax = axes[0, 1]
    ax.hist(pct_errors, bins=30, color="#7c3aed", alpha=0.7, edgecolor="white")
    ax.axvline(0, color="red", linestyle="--")
    ax.set_xlabel("Erreur (%)")
    ax.set_title(f"Distribution erreurs — MAPE={metrics['mape']:.1f}%")

    # 3. Résidus vs Prix réel
    ax = axes[1, 0]
    ax.scatter(prix_reel / 1e6, residuals / 1e6, alpha=0.4, s=20, color="#059669")
    ax.axhline(0, color="red", linestyle="--")
    ax.set_xlabel("Prix réel (M MAD)")
    ax.set_ylabel("Résidu (M MAD)")
    ax.set_title("Résidus vs Prix réel")

    # 4. Feature importance top-15
    ax = axes[1, 1]
    try:
        xgb_model  = pipeline.named_steps["model"]
        preproc    = pipeline.named_steps["preprocessor"]
        feat_names = (
            list(preproc.transformers_[0][2])  # num
            + list(preproc.named_transformers_["cat"].get_feature_names_out(
                preproc.transformers_[1][2]))
        )
        importances = xgb_model.feature_importances_
        n = min(15, len(importances))
        idx = np.argsort(importances)[-n:]
        ax.barh(range(n), importances[idx], color="#d97706")
        ax.set_yticks(range(n))
        ax.set_yticklabels([feat_names[i] for i in idx], fontsize=8)
        ax.set_title("Top 15 importances")
    except Exception as e:
        ax.text(0.5, 0.5, f"Importances indisponibles\n{e}", ha="center", va="center")

    plt.tight_layout()
    if save_dir:
        save_dir.mkdir(parents=True, exist_ok=True)
        fig.savefig(save_dir / "locaux_results.png", dpi=150, bbox_inches="tight")
        print(f"   Graphique sauvegardé : {save_dir / 'locaux_results.png'}")
    plt.show()

# ─────────────────────────────────────────────
# 9. PRÉDICTION UNITAIRE
# ─────────────────────────────────────────────

def predict_price(pipeline: Pipeline, bien_dict: dict, stats: dict) -> dict:
    """
    Prédit le prix d'un local commercial.
    Si mode == 'range' → fourchette ±35% autour du point central.

    bien_dict exemple :
    {
        "surface_num": 120,
        "zone_clean":  "gueliz",
        "type_local":  "bureau",
        "etage":       2,
        "parking":     1,
        "climatisation": 1,
        "titre":       "Bureau lumineux angle Guéliz",
    }
    """
    # Normaliser la zone (fix accents)
    bien_dict = bien_dict.copy()
    if "zone_clean" in bien_dict:
        bien_dict["zone_clean"] = normalize_text(bien_dict["zone_clean"])

    # Keywords NLP depuis le titre si fourni
    if "titre" in bien_dict:
        kws = extract_keywords(bien_dict["titre"])
        for k, v in kws.items():
            bien_dict.setdefault(k, v)

    # Construire un DataFrame mono-ligne
    df_pred = pd.DataFrame([bien_dict])

    # Features dérivées minimales
    df_pred["surface_num"]   = float(bien_dict.get("surface_num", 80))
    df_pred["log_surface"]   = np.log1p(df_pred["surface_num"])
    df_pred["log_surface_sq"] = df_pred["log_surface"] ** 2
    df_pred["prix_m2"]       = stats.get("city_median", 2_000_000) / df_pred["surface_num"]
    df_pred["log_prix_total"] = np.log(stats.get("city_median", 2_000_000))  # dummy pour build_features
    df_pred["source_clean"]  = str(bien_dict.get("source_clean", "inconnu"))
    df_pred["type_local"]    = str(bien_dict.get("type_local", "local_comm"))
    df_pred["is_particulier"] = int(bien_dict.get("is_particulier", 0))
    df_pred["etage"]          = int(bien_dict.get("etage", 0))
    for col in ["parking","ascenseur","climatisation","securite","vue","neuf"]:
        df_pred[col] = int(bien_dict.get(col, 0))
    for col in ["kw_bureau","kw_depot","kw_industriel","kw_salle","kw_angle",
                "kw_hotel","kw_titre","kw_renove","kw_urgent"]:
        df_pred[col] = int(bien_dict.get(col, 0))
    df_pred["score_local"] = sum(df_pred[c].iloc[0] for c in ["parking","climatisation","securite","vue","neuf"] if c in df_pred)

    X_pred, _ = build_features(df_pred, stats=stats, is_train=False)
    log_prix_pred = pipeline.predict(X_pred)[0]
    prix_point    = float(np.exp(log_prix_pred))
    surface       = float(bien_dict.get("surface_num", 80))
    pm2           = prix_point / surface

    mode = stats.get("mode", "point")

    if mode == "range":
        margin = 0.35
        result = {
            "mode":          "fourchette",
            "prix_min":      round(prix_point * (1 - margin), -3),
            "prix_estime":   round(prix_point, -3),
            "prix_max":      round(prix_point * (1 + margin), -3),
            "pm2_estime":    round(pm2, -2),
            "surface":       surface,
            "note":          "Fourchette ±35% — marché locaux hétérogène",
        }
    else:
        result = {
            "mode":        "point",
            "prix_estime": round(prix_point, -3),
            "pm2_estime":  round(pm2, -2),
            "surface":     surface,
        }

    print(f"\n💰 Prédiction locaux ({mode}) :")
    if mode == "range":
        print(f"   Fourchette : {result['prix_min']:,.0f} — {result['prix_max']:,.0f} MAD")
    print(f"   Prix estimé : {result['prix_estime']:,.0f} MAD")
    print(f"   Prix/m²     : {result['pm2_estime']:,.0f} MAD/m²")
    # predict_price retourne un dict ; pour compat notebook (prix * 0.70),
    # on expose aussi prix_point comme attribut numérique
    result["prix_point"] = float(prix_point)
    return result

# ─────────────────────────────────────────────
# 10. PIPELINE COMPLET
# ─────────────────────────────────────────────

def run_pipeline(tune: bool = True, n_trials: int = 40):
    print("\n" + "=" * 60)
    print("  PIPELINE LOCAUX COMMERCIAUX v2")
    print("=" * 60)

    # 1. Données
    df = load_data()

    # 2. Split + encoding
    print("\n📂 Split train/test...")
    X_train, X_test, y_train, y_test, stats = split_and_encode(df)

    # 3. Hyperparamètres
    xgb_params = None
    if tune:
        xgb_params = tune_hyperparams(X_train, y_train, stats, n_trials=n_trials)

    # 4. Construction + entraînement
    pipeline_final = build_pipeline(stats, xgb_params)
    pipeline_final = train(pipeline_final, X_train, y_train)

    # 5. Évaluation
    metrics = evaluate(pipeline_final, X_train, X_test, y_train, y_test)
    stats["mode"] = metrics["mode"]

    # 6. Graphiques
    plot_results(pipeline_final, X_test, y_test, metrics)

    # 7. Sauvegarde
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline_final, "stats": stats}, MODEL_PATH)
    print(f"\n✅ Modèle sauvegardé : {MODEL_PATH}")

    return pipeline_final, stats, metrics


# ─────────────────────────────────────────────
# POINT D'ENTRÉE
# ─────────────────────────────────────────────
if __name__ == "__main__":
    pipeline_final, stats, metrics = run_pipeline(tune=True, n_trials=40)

    # Exemple de prédiction unitaire
    exemple = {
        "surface_num":   120,
        "zone_clean":    "Guéliz",   # accents tolérés grâce à normalize_text
        "type_local":    "bureau",
        "etage":         2,
        "parking":       1,
        "climatisation": 1,
        "titre":         "Bureau lumineux angle Guéliz titre foncier",
    }
    result = predict_price(pipeline_final, exemple, stats)
    print(result)