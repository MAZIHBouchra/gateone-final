
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

#  CHEMINS 
BASE_DIR   = Path(__file__).resolve().parent.parent.parent
DATA_PATH  = BASE_DIR / "data/marrakech_immo_location/locaux_location.csv"
MODEL_PATH = BASE_DIR / "model_training/models/xgb_locaux_location.pkl"

#  CONSTANTES 
TARGET_LOG = "log_prix"

NUMERIC_FEATURES = [
    "log_surface", "log_surface_sq",
    "te_lp_zone", "te_lp_std",
    "loyer_median_zone", "loyer_moy_zone", "nb_listings_zone",
    "ratio_pm2_city", "surface_relative", "score_local",
    "surf_x_type", "etage",
]

BINARY_FEATURES = [
    "parking", "ascenseur", "climatisation", "securite",
    "vue", "neuf", "meuble",
    "kw_bureau", "kw_depot", "kw_industriel", "kw_salle",
    "kw_angle", "kw_renove", "kw_urgent",
]

CATEGORICAL_FEATURES = ["zone_clean", "type_local", "source_clean"]


#  UTILITAIRES ─

def normalize_text(s: str) -> str:
    if not isinstance(s, str):
        return str(s)
    nfkd = unicodedata.normalize("NFKD", s)
    return nfkd.encode("ascii", "ignore").decode("ascii").strip().lower()


def extract_keywords(text: str) -> dict:
    t = str(text).lower()
    return {
        "kw_bureau":     int(bool(re.search(r"bureau|office", t))),
        "kw_depot":      int(bool(re.search(r"d[eé]p[oô]t|entrep[oô]t|stock|hangar", t))),
        "kw_industriel": int(bool(re.search(r"industriel|usine|atelier", t))),
        "kw_salle":      int(bool(re.search(r"salle|r[eé]ception|f[eê]te|[eé]v[eé]nement", t))),
        "kw_angle":      int(bool(re.search(r"angle|corner", t))),
        "kw_renove":     int(bool(re.search(r"r[eé]nov|refait|neuf|r[eé]cent|modern", t))),
        "kw_urgent":     int(bool(re.search(r"urgent|opportunit", t))),
    }


TYPE_BIEN_MAP = {
    "locaux": "local_comm", "local": "local_comm",
    "commerce": "local_comm", "location commerce": "local_comm",
    "locaux commerciaux-bureaux": "bureau",
    "appartement": "local_comm",
}


def infer_type_local(row: pd.Series) -> str:
    if row.get("kw_bureau"):     return "bureau"
    if row.get("kw_depot"):      return "depot"
    if row.get("kw_industriel"): return "industriel"
    if row.get("kw_salle"):      return "salle"
    return "local_comm"


#  1. CHARGEMENT & NETTOYAGE ─

def load_data(path: Path = DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f" Chargement : {len(df)} lignes, {df.shape[1]} colonnes")

    # Déduplication
    df = df.drop_duplicates(subset=["prix_num", "surface_num", "localisation"]).copy()

    #  Zone 
    if "quartier" in df.columns:
        df["zone_clean"] = df["quartier"].fillna("autre")
    elif "localisation" in df.columns:
        df["zone_clean"] = df["localisation"].str.split(",").str[0].str.strip()
    else:
        df["zone_clean"] = "autre"
    df["zone_clean"] = df["zone_clean"].apply(normalize_text)

    #  Surface 
    df["surface_num"] = pd.to_numeric(df["surface_num"], errors="coerce")
    df = df[df["surface_num"].between(5, 10_000)].copy()

    #  Prix (loyer mensuel MAD) 
    df["prix_num"] = pd.to_numeric(df["prix_num"], errors="coerce")
    # Filtres marché locaux location : 500 – 200 000 MAD/mois
    df = df[df["prix_num"].between(500, 200_000)].copy()

    # Prix/m²  — locaux: 5–5 000 MAD/m²/mois
    df["prix_m2"] = df["prix_num"] / df["surface_num"]
    df = df[df["prix_m2"].between(5, 5_000)].copy()

    # Outliers log
    log_p = np.log(df["prix_num"])
    df = df[(log_p >= log_p.quantile(0.01)) & (log_p <= log_p.quantile(0.99))].copy()

    #  NLP keywords 
    text = (df["titre"].fillna("") + " " + df["description"].fillna("")).str.lower() \
        if "description" in df.columns else df["titre"].fillna("").str.lower()
    kw_df = text.apply(extract_keywords).apply(pd.Series)
    for col in kw_df.columns:
        df[col] = kw_df[col].values

    #  Type local 
    if "type_bien" in df.columns:
        mapped = df["type_bien"].fillna("").str.lower().str.strip().map(TYPE_BIEN_MAP)
        df["type_local"] = mapped.where(mapped.notna(), df.apply(infer_type_local, axis=1))
    else:
        df["type_local"] = df.apply(infer_type_local, axis=1)

    #  Équipements binaires 
    for col in ["parking", "ascenseur", "climatisation", "securite",
                "vue", "neuf", "meuble", "cave", "hammam", "terrasse", "jardin"]:
        if col not in df.columns:
            df[col] = 0
        df[col] = df[col].fillna(0).astype(int)

    #  Étage 
    df["etage"] = pd.to_numeric(df.get("etage", 0), errors="coerce").fillna(0).clip(0, 20)

    #  Source 
    if "source" in df.columns:
        df["source_clean"] = df["source"].fillna("inconnu").str.lower().str.strip()
    elif "agence" in df.columns:
        df["source_clean"] = df["agence"].apply(
            lambda x: "particulier" if pd.isna(x) or str(x).strip() in ("", "nan") else "agence"
        )
    else:
        df["source_clean"] = "inconnu"

    #  Features de base 
    df["log_surface"]    = np.log1p(df["surface_num"])
    df["log_surface_sq"] = df["log_surface"] ** 2
    df["log_prix"]       = np.log(df["prix_num"])
    df["score_local"]    = df[["parking", "climatisation", "securite", "vue", "neuf"]].sum(axis=1)

    print(f"   Après nettoyage : {len(df)} lignes")
    print(f"   Loyer médian    : {df['prix_num'].median():,.0f} MAD/mois")
    print(f"   Surface médiane : {df['surface_num'].median():.0f} m²")
    print(f"   type_local      :\n{df['type_local'].value_counts().to_string()}")
    return df


#  2. SPLIT + FEATURE ENGINEERING (sans leakage) 

def build_features(df: pd.DataFrame, stats: dict = None, is_train: bool = True):
    data = df.copy()

    if is_train:
        # Target encoding zone
        zs = (data.groupby("zone_clean")["log_prix"]
              .agg(["mean", "std", "count"])
              .rename(columns={"mean": "te_lp_zone", "std": "te_lp_std", "count": "nb_listings_zone"}))
        zs["loyer_median_zone"] = data.groupby("zone_clean")["prix_num"].median()
        zs["loyer_moy_zone"]    = data.groupby("zone_clean")["prix_num"].mean()

        global_mean  = data["log_prix"].mean()
        global_std   = data["log_prix"].std()
        city_median  = data["prix_num"].median()
        city_surf_med = data["surface_num"].median()

        # Type-surface stats
        ts = (data.groupby("type_local")["log_surface"]
              .agg(["mean", "std"])
              .rename(columns={"mean": "ts_mean", "std": "ts_std"}))

        stats = {
            "zone_stats": zs, "global_mean": global_mean,
            "global_std": global_std, "city_median": city_median,
            "city_surf_med": city_surf_med, "type_surf_stats": ts,
        }
    else:
        assert stats is not None
        zs           = stats["zone_stats"]
        global_mean  = stats["global_mean"]
        city_median  = stats["city_median"]
        city_surf_med = stats["city_surf_med"]
        ts           = stats["type_surf_stats"]

    # Merge zone stats
    data = data.merge(zs.reset_index(), on="zone_clean", how="left")
    data["te_lp_zone"]       = data["te_lp_zone"].fillna(global_mean)
    data["te_lp_std"]        = data["te_lp_std"].fillna(0.5)
    data["nb_listings_zone"] = data["nb_listings_zone"].fillna(1)
    data["loyer_median_zone"] = data["loyer_median_zone"].fillna(city_median)
    data["loyer_moy_zone"]    = data["loyer_moy_zone"].fillna(city_median)

    # Merge type-surface stats
    data = data.merge(ts.reset_index(), on="type_local", how="left")
    data["ts_mean"] = data["ts_mean"].fillna(data["log_surface"].mean())
    data["ts_std"]  = data["ts_std"].fillna(0.5)
    data["surf_x_type"] = (data["log_surface"] - data["ts_mean"]) / (data["ts_std"] + 1e-6)

    # Ratio pm² vs ville
    data["ratio_pm2_city"] = data["prix_m2"] / (city_median / city_surf_med)

    # Surface relative dans la zone
    zone_surf_med = data.groupby("zone_clean")["surface_num"].transform("median")
    data["surface_relative"] = data["surface_num"] / zone_surf_med.replace(0, np.nan).fillna(city_surf_med)

    avail = lambda cols: [c for c in cols if c in data.columns]
    feat_cols = avail(NUMERIC_FEATURES) + avail(BINARY_FEATURES) + avail(CATEGORICAL_FEATURES)

    X = data[feat_cols].copy()
    for c in avail(BINARY_FEATURES):
        X[c] = X[c].fillna(0).astype(int)
    for c in avail(NUMERIC_FEATURES):
        X[c] = X[c].fillna(X[c].median())

    stats["feature_cols"]     = feat_cols
    stats["numeric_cols"]     = avail(NUMERIC_FEATURES)
    stats["binary_cols"]      = avail(BINARY_FEATURES)
    stats["categorical_cols"] = avail(CATEGORICAL_FEATURES)
    return X, stats


def split_and_encode(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42):
    train_df, test_df = train_test_split(df, test_size=test_size, random_state=random_state)
    print(f"   Train : {len(train_df)} | Test : {len(test_df)}")

    X_train, stats = build_features(train_df, is_train=True)
    y_train = train_df["log_prix"].values

    X_test, _ = build_features(test_df, stats=stats, is_train=False)
    y_test = test_df["log_prix"].values

    return X_train, X_test, y_train, y_test, train_df, test_df, stats


#  3. PIPELINE SKLEARN ─

def build_pipeline(stats_or_X, xgb_params: dict = None) -> Pipeline:
    if isinstance(stats_or_X, dict):
        num_cols = stats_or_X["numeric_cols"] + stats_or_X["binary_cols"]
        cat_cols = stats_or_X["categorical_cols"]
    else:
        X = stats_or_X
        cat_cols = [c for c in CATEGORICAL_FEATURES if c in X.columns]
        num_cols = [c for c in NUMERIC_FEATURES + BINARY_FEATURES if c in X.columns]

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ], remainder="drop")

    default_xgb = dict(
        n_estimators=400, max_depth=4, learning_rate=0.05,
        subsample=0.8, colsample_bytree=0.8, min_child_weight=5,
        reg_alpha=0.1, reg_lambda=1.0, random_state=42, n_jobs=-1,
    )
    if xgb_params:
        default_xgb.update(xgb_params)

    return Pipeline([("preprocessor", preprocessor), ("model", XGBRegressor(**default_xgb))])


#  4. OPTUNA ─

def tune_hyperparams(X_train, y_train, stats, n_trials: int = 40) -> dict:
    print(f"🔍 Tuning hyperparamètres ({n_trials} trials)...")

    def objective(trial):
        params = dict(
            n_estimators     = trial.suggest_int("n_estimators", 100, 700),
            max_depth        = trial.suggest_int("max_depth", 3, 7),
            learning_rate    = trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
            subsample        = trial.suggest_float("subsample", 0.6, 1.0),
            colsample_bytree = trial.suggest_float("colsample_bytree", 0.5, 1.0),
            min_child_weight = trial.suggest_int("min_child_weight", 3, 15),
            reg_alpha        = trial.suggest_float("reg_alpha", 0.0, 2.0),
            reg_lambda       = trial.suggest_float("reg_lambda", 0.5, 5.0),
            random_state=42, n_jobs=-1,
        )
        pipe = build_pipeline(stats, params)
        cv = KFold(n_splits=5, shuffle=True, random_state=42)
        return cross_val_score(pipe, X_train, y_train, cv=cv, scoring="r2", n_jobs=-1).mean()

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)
    print(f"   Meilleur CV R² : {study.best_value:.3f} | Params : {study.best_params}")
    return study.best_params


#  5. ENTRAÎNEMENT ─

def train(pipeline, X_train, y_train):
    print(" Entraînement...")
    pipeline.fit(X_train, y_train)
    return pipeline


#  6. ÉVALUATION ─

def evaluate(pipeline, X_train, X_test, y_train, y_test):
    y_pred_tr = pipeline.predict(X_train)
    y_pred_te = pipeline.predict(X_test)

    r2_train = r2_score(y_train, y_pred_tr)
    r2_test  = r2_score(y_test,  y_pred_te)

    prix_reel = np.exp(y_test)
    prix_pred = np.exp(y_pred_te)
    mape = mean_absolute_percentage_error(prix_reel, prix_pred) * 100
    mad  = float(np.median(np.abs(prix_pred - prix_reel)))

    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_r2 = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="r2")

    print("\n" + "=" * 50)
    print("  MÉTRIQUES — LOCAUX COMMERCIAUX LOCATION")
    print("=" * 50)
    print(f"  R² train        : {r2_train:.3f}")
    print(f"  R² test         : {r2_test:.3f}")
    print(f"  MAPE            : {mape:.1f}%")
    print(f"  MAD loyer       : {mad:,.0f} MAD/mois")
    print(f"  CV R² (5-fold)  : {cv_r2.mean():.3f} ± {cv_r2.std():.3f}")

    mode = "point" if r2_test >= 0.55 else "range"
    if mode == "range":
        print("\n   R² < 0.55 — mode FOURCHETTE ±35% activé")

    return {
        "r2_train": r2_train, "r2_test": r2_test,
        "mape": mape, "mad": mad,
        "cv_mean": float(cv_r2.mean()), "cv_std": float(cv_r2.std()),
        "mode": mode,
        "R²": r2_test, "MAPE (%)": mape,
        "MAE (MAD)": float(np.mean(np.abs(prix_pred - prix_reel))),
        "RMSE (MAD)": float(np.sqrt(np.mean((prix_pred - prix_reel) ** 2))),
    }


#  7. GRAPHIQUES ─

def plot_results(pipeline, X_test, y_test, metrics: dict = None, save_dir: Path = None):
    prix_reel = np.exp(y_test)
    prix_pred = np.exp(pipeline.predict(X_test))
    if metrics is None:
        metrics = {"r2_test": r2_score(y_test, pipeline.predict(X_test)),
                   "mape": mean_absolute_percentage_error(prix_reel, prix_pred) * 100}

    residuals  = prix_pred - prix_reel
    pct_errors = residuals / prix_reel * 100

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(
        f"Locaux Location — R²={metrics['r2_test']:.2f} | MAPE={metrics['mape']:.1f}%",
        fontsize=14, fontweight="bold"
    )

    ax = axes[0, 0]
    ax.scatter(prix_reel / 1e3, prix_pred / 1e3, alpha=0.5, s=20, color="#2563eb")
    lim = max(prix_reel.max(), prix_pred.max()) / 1e3 * 1.05
    ax.plot([0, lim], [0, lim], "r--", lw=1.5, label="Parfait")
    ax.set_xlabel("Loyer réel (K MAD)"); ax.set_ylabel("Loyer prédit (K MAD)")
    ax.set_title("Réel vs Prédit"); ax.legend()

    ax = axes[0, 1]
    ax.hist(pct_errors, bins=30, color="#7c3aed", alpha=0.7, edgecolor="white")
    ax.axvline(0, color="red", linestyle="--")
    ax.set_xlabel("Erreur (%)"); ax.set_title(f"Distribution erreurs — MAPE={metrics['mape']:.1f}%")

    ax = axes[1, 0]
    ax.scatter(prix_reel / 1e3, residuals / 1e3, alpha=0.4, s=20, color="#059669")
    ax.axhline(0, color="red", linestyle="--")
    ax.set_xlabel("Loyer réel (K MAD)"); ax.set_ylabel("Résidu (K MAD)")
    ax.set_title("Résidus vs Loyer réel")

    ax = axes[1, 1]
    try:
        xgb_model = pipeline.named_steps["model"]
        preproc   = pipeline.named_steps["preprocessor"]
        feat_names = (list(preproc.transformers_[0][2])
                      + list(preproc.named_transformers_["cat"]
                             .get_feature_names_out(preproc.transformers_[1][2])))
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
        fig.savefig(save_dir / "locaux_location_results.png", dpi=150, bbox_inches="tight")
    plt.show()


#  8. PRÉDICTION UNITAIRE 

def predict_price(pipeline, bien_dict: dict, stats: dict) -> dict:
    """
    Prédit le loyer mensuel d'un local commercial.

    Exemple :
        {"surface_num": 80, "zone_clean": "Guéliz", "type_local": "bureau",
         "parking": 1, "climatisation": 1, "titre": "Bureau angle Guéliz"}
    """
    b = bien_dict.copy()
    b["zone_clean"] = normalize_text(b.get("zone_clean", "autre"))

    if "titre" in b:
        for k, v in extract_keywords(b["titre"]).items():
            b.setdefault(k, v)

    surface = float(b.get("surface_num", 80))
    city_median  = stats.get("city_median", 12_500)
    city_surf_med = stats.get("city_surf_med", 80)

    b.setdefault("type_local",   "local_comm")
    b.setdefault("source_clean", "inconnu")
    b.setdefault("etage",        0)
    b["surface_num"]    = surface
    b["log_surface"]    = np.log1p(surface)
    b["log_surface_sq"] = b["log_surface"] ** 2
    b["prix_m2"]        = city_median / city_surf_med
    b["prix_num"]       = city_median
    b["log_prix"]       = np.log(city_median)
    b["score_local"]    = sum(int(b.get(c, 0)) for c in ["parking", "climatisation", "securite", "vue", "neuf"])
    for col in BINARY_FEATURES:
        b.setdefault(col, 0)

    df_pred = pd.DataFrame([b])
    X_pred, _ = build_features(df_pred, stats=stats, is_train=False)
    loyer = float(np.exp(pipeline.predict(X_pred)[0]))
    pm2   = loyer / surface
    mode  = stats.get("mode", "point")

    if mode == "range":
        margin = 0.35
        result = {
            "mode": "fourchette",
            "loyer_min":    round(loyer * (1 - margin), -2),
            "loyer_estime": round(loyer, -2),
            "loyer_max":    round(loyer * (1 + margin), -2),
            "pm2_estime":   round(pm2, 1),
            "surface":      surface,
            "note":         "Fourchette ±35% — marché locaux hétérogène",
        }
        print(f"\n Locaux location (fourchette) : {result['loyer_min']:,.0f} — {result['loyer_max']:,.0f} MAD/mois")
    else:
        result = {
            "mode": "point",
            "loyer_estime": round(loyer, -2),
            "pm2_estime":   round(pm2, 1),
            "surface":      surface,
        }
        print(f"\n Locaux location : {result['loyer_estime']:,.0f} MAD/mois | {pm2:.1f} MAD/m²/mois")

    result["loyer_point"] = loyer
    return result


#  9. PIPELINE COMPLET ─

def run_pipeline(tune: bool = True, n_trials: int = 40):
    print("\n" + "=" * 60)
    print("  PIPELINE LOCAUX COMMERCIAUX — LOCATION v1")
    print("=" * 60)

    df = load_data()

    print("\n Split train/test...")
    X_train, X_test, y_train, y_test, train_df, test_df, stats = split_and_encode(df)

    xgb_params = None
    if tune:
        xgb_params = tune_hyperparams(X_train, y_train, stats, n_trials=n_trials)

    pipeline_final = build_pipeline(stats, xgb_params)
    pipeline_final = train(pipeline_final, X_train, y_train)

    metrics = evaluate(pipeline_final, X_train, X_test, y_train, y_test)
    stats["mode"] = metrics["mode"]

    plot_results(pipeline_final, X_test, y_test, metrics,
                 save_dir=BASE_DIR / "notebooks/locations")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline_final, "stats": stats}, MODEL_PATH)
    print(f"\n Modèle sauvegardé : {MODEL_PATH}")

    return pipeline_final, stats, metrics


#  POINT D'ENTRÉE 
if __name__ == "__main__":
    pipeline_final, stats, metrics = run_pipeline(tune=True, n_trials=40)

    exemple = {
        "surface_num":   80,
        "zone_clean":    "Guéliz",
        "type_local":    "bureau",
        "etage":         1,
        "parking":       1,
        "climatisation": 1,
        "titre":         "Bureau climatisé angle Guéliz",
    }
    result = predict_price(pipeline_final, exemple, stats)
    print(result)
