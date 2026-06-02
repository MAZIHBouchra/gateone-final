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
from sklearn.metrics import r2_score, mean_absolute_percentage_error, mean_absolute_error
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")
optuna.logging.set_verbosity(optuna.logging.WARNING)

# CHEMINS
BASE_DIR   = Path(__file__).resolve().parent.parent.parent
DATA_PATH  = BASE_DIR / "data/marrakech_immo_location/riad_location.csv"
MODEL_PATH = BASE_DIR / "model_training/models/xgb_riad_location.pkl"

EUR_TO_MAD = 10.8

# CONSTANTES EXPORTÉES
TARGET_LOG = "log_prix"

NUMERIC_FEATURES = [
    # Surface
    "surface_num", "log_surface", "surface_par_chambre", "ratio_sdb_ch",
    # Pièces
    "chambres_num", "salles_bain_num", "nb_pieces",
    # Etage
    "etage_num", "etage_known",
    # Standing & équipements
    "score_standing", "score_confort", "nb_equipements",
    # Interactions
    "surf_x_ch", "surf_x_standing",
    # NLP keywords
    "kw_hote", "kw_renove", "kw_patio", "kw_bassin", "kw_acces",
    "kw_titre", "kw_hammam", "kw_toit",
    # Zone stats (groupby train)
    "te_log_prix_zone", "te_log_prix_loc",
    "pm2_median_zone", "pm2_median_loc",
    "surface_relative", "surface_x_loc",
    "log_prix_estime", "zone_bias",
]

BINARY_FEATURES = [
    "piscine", "parking", "ascenseur", "terrasse", "jardin",
    "climatisation", "securite", "vue", "meuble", "neuf", "cave", "hammam",
    "is_particulier"
]

CATEGORICAL_FEATURES = [
    "zone_clean", "localisation_fine", "segment_prix", "cat_surface",
]

# ZONE MAP — localisation texte → zone propre
ZONE_MAP = [
    ("Médina",             r"m[eé]dina|ancienne.m[eé]dina|kasbah|mellah|bab.doukkala|jemaa|riad.zitoun|dar.el.bacha"),
    ("Guéliz",             r"gueliz|guéliz"),
    ("Hivernage",          r"hivernage"),
    ("Palmeraie",          r"palmeraie|ennakhil"),
    ("Route d'Ourika",     r"ourika"),
]

LOC_FINE_MAP = [
    ("bab_doukkala",   r"bab.doukkala"),
    ("kasbah",         r"kasbah"),
    ("jemaa_el_fna",   r"jemaa|fna"),
    ("mellah",         r"mellah"),
    ("dar_el_bacha",   r"dar.el.bacha"),
    ("riad_zitoun",    r"riad.zitoun"),
    ("ryad_laarouss",  r"ryad.la[aâ]rouss|la[aâ]rouss"),
    ("sidi_youssef",   r"sidi.youssef|syba"),
    ("medina_autre",   r"m[eé]dina|ancienne.m[eé]dina"),
    ("palmeraie",      r"palmeraie|ennakhil"),
    ("gueliz",         r"gueliz|guéliz"),
]

def normalize_text(s):
    if not isinstance(s, str): return ""
    nfkd = unicodedata.normalize("NFKD", s)
    return nfkd.encode("ascii", "ignore").decode().strip().lower()

def extract_zone(row):
    for col in ["quartier", "localisation"]:
        q = str(row.get(col, "") or "").strip()
        q = re.sub(r"(?i)^marrakech\s*[-–,]\s*", "", q).strip()
        if q and q.lower() not in ("", "nan", "autre", "autre secteur", "marrakech"):
            nq = normalize_text(q)
            for name, pat in ZONE_MAP:
                if re.search(pat, nq):
                    return name
    text = " ".join([str(row.get(c, "") or "") for c in ["titre", "localisation", "description"]]).lower()
    for name, pat in ZONE_MAP:
        if re.search(pat, text):
            return name
    return "Autre"

def extract_localisation_fine(row):
    text = " ".join([str(row.get(c, "") or "") for c in ["localisation", "titre", "description"]]).lower()
    for name, pat in LOC_FINE_MAP:
        if re.search(pat, text):
            return name
    return "autre_zone"

def extract_keywords(titre, description=""):
    text = (str(titre) + " " + str(description)).lower()
    return {
        "kw_hote":     int(bool(re.search(r"maison.d.h[oô]te|guesthouse|b&b", text))),
        "kw_renove":   int(bool(re.search(r"rénov|renov|refait|restaur", text))),
        "kw_patio":    int(bool(re.search(r"patio|cour.int", text))),
        "kw_bassin":   int(bool(re.search(r"bassin|plunge", text))),
        "kw_acces":    int(bool(re.search(r"acc[èe]s.voiture|parking.proche", text))),
        "kw_titre":    int(bool(re.search(r"titre.foncier|melk|tf\b", text))),
        "kw_hammam":   int(bool(re.search(r"hammam|bain.maure|spa", text))),
        "kw_toit":     int(bool(re.search(r"toit|terrasse.toit|rooftop", text))),
    }

# 1. LOAD DATA
def load_data(path: Path = DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(path)
    print(f" Chargement : {len(df)} lignes, {df.shape[1]} colonnes")

    # Riads uniquement
    df = df[df["type_bien"].isin(["Riad", "Vente Riad"])].copy()
    print(f"   Riads : {len(df)}")

    # ── Prix ──
    price_col = next((c for c in ["prix_num", "prix_total", "prix"] if c in df.columns and pd.to_numeric(df[c], errors="coerce").notna().sum() > len(df) * 0.1), None)
    df["prix_num"] = pd.to_numeric(df[price_col], errors="coerce")

    if "prix" in df.columns:
        eur_mask = df["prix"].astype(str).str.contains("EUR", na=False)
        df.loc[eur_mask, "prix_num"] *= EUR_TO_MAD

    # ── Surface ──
    surf_col = next((c for c in ["surface_num", "surface"] if c in df.columns and pd.to_numeric(df[c], errors="coerce").notna().sum() > len(df) * 0.1), None)
    df["surface_num"] = pd.to_numeric(df[surf_col], errors="coerce")

    # ── Filtres ──
    df = df[df["prix_num"].between(500, 2_000_000)].copy()
    df = df[df["surface_num"].between(30, 2_000)].copy()
    df["_pm2"] = df["prix_num"] / df["surface_num"]
    df = df[df["_pm2"].between(10, 5_000)].copy()
    df.drop(columns=["_pm2"], inplace=True)

    log_p = np.log(df["prix_num"])
    df = df[(log_p >= log_p.quantile(0.01)) & (log_p <= log_p.quantile(0.99))].copy()
    df.reset_index(drop=True, inplace=True)
    print(f"   Après filtres : {len(df)} lignes")

    # ── Zones ──
    df["zone_clean"]        = df.apply(extract_zone, axis=1)
    df["localisation_fine"] = df.apply(extract_localisation_fine, axis=1)

    # ── Features surface ──
    df["log_surface"]       = np.log(df["surface_num"])
    df["chambres_num"]      = pd.to_numeric(df.get("chambres_num", df.get("chambres")), errors="coerce").fillna(4).clip(0, 20)
    df["salles_bain_num"]   = pd.to_numeric(df.get("salles_bain_num", df.get("salles_bain")), errors="coerce").fillna(2).clip(0, 20)
    df["nb_pieces"]         = pd.to_numeric(df.get("nb_pieces"), errors="coerce").fillna(df["chambres_num"] + df["salles_bain_num"])

    df["surface_par_chambre"] = df["surface_num"] / (df["chambres_num"].replace(0, 1))
    df["ratio_sdb_ch"]        = df["salles_bain_num"] / (df["chambres_num"].replace(0, 1))

    # ── Étage ──
    df["etage_num"]   = pd.to_numeric(df.get("etage"), errors="coerce").fillna(-1).clip(-1, 5)
    df["etage_known"] = (df["etage_num"] >= 0).astype(int)
    df.loc[df["etage_num"] < 0, "etage_num"] = 0

    # ── Équipements binaires ──
    for col in BINARY_FEATURES:
        if col not in df.columns:
            df[col] = 0
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

    df["is_particulier"] = (df.get("agence", "").astype(str).str.lower().isin(["particulier","nan",""])).astype(int)

    # ── Scores composites ──
    df["score_standing"] = (df["piscine"] * 3 + df["climatisation"] * 2 + df["securite"] * 2 + df["vue"] * 2 + df["neuf"] * 2 + df["hammam"])
    df["score_confort"]  = (df["parking"] + df["terrasse"] + df["jardin"] + df["meuble"] + df["cave"])
    df["nb_equipements"] = df[["piscine","parking","terrasse","jardin","climatisation","securite","vue","meuble","neuf","cave","hammam","ascenseur"]].sum(axis=1)

    # ── Interactions ──
    df["surf_x_ch"]       = df["surface_num"] * df["chambres_num"]
    df["surf_x_standing"] = df["surface_num"] * df["score_standing"]

    # ── Keywords NLP ──
    titre_col = "titre" if "titre" in df.columns else None
    desc_col  = "description" if "description" in df.columns else None
    kw_df = df.apply(lambda r: extract_keywords(
        r.get(titre_col, "") if titre_col else "",
        r.get(desc_col, "")  if desc_col  else ""
    ), axis=1).apply(pd.Series)
    for col in kw_df.columns:
        df[col] = kw_df[col].values

    # ── cat_surface ──
    df["cat_surface"] = pd.cut(
        df["surface_num"],
        bins=[0, 80, 150, 250, 400, 5000],
        labels=["tiny", "small", "medium", "large", "estate"]
    ).astype(str)

    # ── Segment prix ──
    df["segment_prix"] = pd.cut(
        df["prix_num"],
        bins=[0, 10_000, 30_000, 80_000, 1e12],
        labels=["eco", "mid", "premium", "ultra"]
    ).astype(str)

    # ── Target ──
    df["log_prix"] = np.log(df["prix_num"])
    df["prix_m2"]  = df["prix_num"] / df["surface_num"]

    print(f"   Prix médian    : {df['prix_num'].median():,.0f} MAD")
    print(f"   Surface médiane: {df['surface_num'].median():.0f} m²")
    print(f"   pm² médian     : {df['prix_m2'].median():,.0f} MAD/m²")
    return df

# 2. FEATURE ENGINEERING
GROUPBY_FEATURES = {
    "te_log_prix_zone", "te_log_prix_loc",
    "pm2_median_zone", "pm2_median_loc",
    "surface_relative", "surface_x_loc",
    "log_prix_estime", "zone_bias",
    "segment_prix", "cat_surface",
}

def split_and_encode(df: pd.DataFrame, test_size: float = 0.2, seed: int = 42, random_state: int = None):
    seed = random_state if random_state is not None else seed
    train_df, test_df = train_test_split(df, test_size=test_size, random_state=seed)
    
    train_df = train_df.copy()
    train_df["_pm2"] = train_df["prix_num"] / train_df["surface_num"]

    z_lp    = train_df.groupby("zone_clean")["log_prix"].mean()
    z_pm2   = train_df.groupby("zone_clean")["_pm2"].median()
    loc_lp  = train_df.groupby("localisation_fine")["log_prix"].mean()
    loc_pm2 = train_df.groupby("localisation_fine")["_pm2"].median()
    z_sm    = train_df.groupby("zone_clean")["surface_num"].mean()
    f_lp      = train_df["log_prix"].mean()
    city_pm2  = train_df["_pm2"].mean()
    
    train_df.drop(columns=["_pm2"], inplace=True)

    _pm2_tr   = train_df["localisation_fine"].map(loc_pm2).fillna(city_pm2)
    _lpe_tr   = np.log((train_df["surface_num"] * _pm2_tr).clip(lower=1))
    _resid_tr = train_df["log_prix"].values - _lpe_tr.values
    z_bias_map   = pd.Series(_resid_tr, index=train_df.index).groupby(train_df["zone_clean"]).mean()
    global_bias  = float(np.mean(_resid_tr))

    stats = dict(
        z_lp=z_lp, z_pm2=z_pm2, z_sm=z_sm,
        loc_lp=loc_lp, loc_pm2=loc_pm2,
        f_lp=f_lp, city_pm2=city_pm2,
        z_bias_map=z_bias_map, global_bias=global_bias,
    )

    def _enrich(X, src_df):
        X = X.copy()
        surf = src_df.loc[X.index, "surface_num"]
        pm2_z   = X["zone_clean"].map(z_pm2).fillna(city_pm2)
        pm2_l   = X["localisation_fine"].map(loc_pm2).fillna(city_pm2)
        X["te_log_prix_zone"] = X["zone_clean"].map(z_lp).fillna(f_lp)
        X["te_log_prix_loc"]  = X["localisation_fine"].map(loc_lp).fillna(f_lp)
        X["pm2_median_zone"]  = pm2_z
        X["pm2_median_loc"]   = pm2_l
        X["surface_relative"] = surf / X["zone_clean"].map(z_sm).fillna(surf.mean())
        X["surface_x_loc"]    = surf * pm2_l / 1e3
        X["log_prix_estime"]  = np.log((surf * pm2_l).clip(lower=1))
        X["zone_bias"]        = X["zone_clean"].map(z_bias_map).fillna(global_bias)
        if "segment_prix" in src_df.columns:
            X["segment_prix"] = src_df.loc[X.index, "segment_prix"].values
        else:
            prix_est = surf * pm2_l
            X["segment_prix"] = pd.cut(prix_est, bins=[0, 10_000, 30_000, 80_000, 1e12], labels=["eco","mid","premium","ultra"]).astype(str).fillna("mid")
        if "cat_surface" in src_df.columns:
            X["cat_surface"] = src_df.loc[X.index, "cat_surface"].values
        return X

    BASE_FEATURES = [c for c in NUMERIC_FEATURES if c not in GROUPBY_FEATURES] + BINARY_FEATURES + CATEGORICAL_FEATURES

    X_base_tr = train_df[[c for c in BASE_FEATURES if c in train_df.columns]].copy()
    X_base_te = test_df[[c for c in BASE_FEATURES if c in test_df.columns]].copy()

    X_train = _enrich(X_base_tr, train_df)
    X_test  = _enrich(X_base_te, test_df)

    for col in set(X_train.columns) - set(X_test.columns): X_test[col] = 0
    for col in set(X_test.columns) - set(X_train.columns): X_train[col] = 0
    X_test = X_test[X_train.columns]

    y_train = train_df["log_prix"].values
    y_test  = test_df["log_prix"].values

    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_train.columns]
    num_cols = [c for c in X_train.columns if c not in cat_cols]
    stats["numeric_cols"] = num_cols
    stats["categorical_cols"] = cat_cols
    stats["feature_cols"] = list(X_train.columns)

    return X_train, X_test, y_train, y_test, train_df, test_df, stats

# 3. PIPELINE SKLEARN
def build_pipeline(stats_or_X, xgb_params: dict = None) -> Pipeline:
    if isinstance(stats_or_X, dict):
        num_cols = stats_or_X["numeric_cols"]
        cat_cols = stats_or_X["categorical_cols"]
    else:
        X = stats_or_X
        cat_cols = [c for c in CATEGORICAL_FEATURES if c in X.columns]
        num_cols = [c for c in X.columns if c not in cat_cols]
    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ], remainder="drop")
    if xgb_params is None:
        xgb_params = dict(n_estimators=400, max_depth=5, learning_rate=0.05, random_state=42)
    return Pipeline([("preprocessor", preprocessor), ("model", XGBRegressor(**xgb_params))])

# 4. OPTUNA
def tune_hyperparams(X_train, y_train, stats, n_trials=150):
    print(f" Optuna {n_trials} trials sur X_train (CV 5-fold)...")

    def objective(trial):
        params = dict(
            n_estimators     = trial.suggest_int("n_estimators", 50, 400),
            max_depth        = trial.suggest_int("max_depth", 2, 4),
            learning_rate    = trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
            max_leaves       = trial.suggest_int("max_leaves", 3, 15),
            subsample        = trial.suggest_float("subsample", 0.5, 1.0),
            colsample_bytree = trial.suggest_float("colsample_bytree", 0.3, 1.0),
            colsample_bylevel= trial.suggest_float("colsample_bylevel", 0.3, 1.0),
            min_child_weight = trial.suggest_int("min_child_weight", 1, 6),
            reg_alpha        = trial.suggest_float("reg_alpha", 0.001, 10.0, log=True),
            reg_lambda       = trial.suggest_float("reg_lambda", 0.001, 10.0, log=True),
            gamma            = trial.suggest_float("gamma", 0.001, 5.0, log=True),
            random_state=42, n_jobs=-1,
        )
        pipe   = build_pipeline(stats, params)
        cv     = KFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="r2", n_jobs=-1)
        return scores.mean()

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=n_trials, show_progress_bar=True)

    print(f" Meilleur R² CV : {study.best_value:.4f}")
    for k, v in study.best_params.items():
        print(f"   {k:30s}: {v}")
    return study.best_params, study

# 5. ENTRAÎNEMENT
def train(pipeline, X_train, y_train):
    print(" Entraînement...")
    pipeline.fit(X_train, y_train)
    return pipeline

# 6. ÉVALUATION
def evaluate(pipeline, X_test, y_test_or_dftest=None, df_test=None,
             X_train=None, y_train=None, cv_folds=5):
    if isinstance(y_test_or_dftest, np.ndarray):
        y_test = y_test_or_dftest
    elif isinstance(y_test_or_dftest, pd.Series):
        y_test = y_test_or_dftest.values
    elif isinstance(y_test_or_dftest, pd.DataFrame):
        df_test = y_test_or_dftest
        y_test  = df_test["log_prix"].values if "log_prix" in df_test.columns else None
    else:
        y_test = None

    y_pred_log = pipeline.predict(X_test)
    if y_test is not None:
        r2 = r2_score(y_test, y_pred_log)
    else:
        r2 = float("nan")

    prix_pred = np.exp(y_pred_log)
    if df_test is not None and "prix_num" in df_test.columns:
        prix_reel = df_test["prix_num"].values
    elif y_test is not None:
        prix_reel = np.exp(y_test)
    else:
        prix_reel = prix_pred

    mape = mean_absolute_percentage_error(prix_reel, prix_pred) * 100
    mae  = mean_absolute_error(prix_reel, prix_pred)
    rmse = float(np.sqrt(np.mean((prix_pred - prix_reel) ** 2)))

    if X_train is not None and y_train is not None:
        r2_train = r2_score(y_train, pipeline.predict(X_train))
    else:
        r2_train = float("nan")

    cv_X = X_train if X_train is not None else X_test
    cv_y = y_train if y_train is not None else y_test
    kf   = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_r2 = cross_val_score(pipeline, cv_X, cv_y, cv=kf, scoring="r2")

    print("\n" + "═" * 45)
    print("  MÉTRIQUES — RIAD LOCATION")
    print("═" * 45)
    print(f"  MAE              : {mae:>15,.0f} MAD")
    print(f"  RMSE             : {rmse:>15,.0f} MAD")
    print(f"  R²               : {r2:>15.4f}")
    print(f"  MAPE             : {mape:>15.2f} %")
    print(f"  CV R² ({cv_folds} folds)  : {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
    print("═" * 45)

    return {
        "R²": r2, "r2_train": r2_train, "MAPE (%)": mape,
        "MAE (MAD)": mae, "RMSE (MAD)": rmse,
        "cv_mean": cv_r2.mean(), "cv_std": cv_r2.std(),
    }

# 7. GRAPHIQUES
def plot_results(pipeline, X_test, y_test_or_dftest=None, metrics=None, save_dir=None):
    if isinstance(y_test_or_dftest, pd.DataFrame):
        df_plot  = y_test_or_dftest
        prix_reel = df_plot["prix_num"].values if "prix_num" in df_plot.columns else np.exp(df_plot["log_prix"].values)
        prix_pred = np.exp(pipeline.predict(X_test))
    else:
        prix_reel = np.exp(y_test_or_dftest)
        prix_pred = np.exp(pipeline.predict(X_test))

    if metrics is None:
        metrics = {
            "R²":       r2_score(np.log(prix_reel), pipeline.predict(X_test)),
            "MAPE (%)": mean_absolute_percentage_error(prix_reel, prix_pred) * 100,
        }

    erreurs = (prix_pred - prix_reel) / prix_reel * 100
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle(f"Riads — R²={metrics['R²']:.3f} | MAPE={metrics['MAPE (%)']:.1f}%",
                 fontsize=14, fontweight="bold")

    ax = axes[0, 0]
    ax.scatter(prix_reel / 1e3, prix_pred / 1e3, alpha=0.4, s=15, color="#2563eb")
    lim = max(prix_reel.max(), prix_pred.max()) / 1e3 * 1.05
    ax.plot([0, lim], [0, lim], "r--", lw=1.5)
    ax.set_xlabel("Prix réel (K MAD)"); ax.set_ylabel("Prix prédit (K MAD)")
    ax.set_title("Réel vs Prédit")

    ax = axes[0, 1]
    ax.hist(erreurs, bins=40, color="#7c3aed", alpha=0.7, edgecolor="white")
    ax.axvline(0, color="red", linestyle="--")
    ax.set_xlabel("Erreur (%)"); ax.set_title(f"Distribution erreurs — MAPE={metrics['MAPE (%)']:.1f}%")

    ax = axes[1, 0]
    ax.scatter(prix_reel / 1e3, (prix_pred - prix_reel) / 1e3, alpha=0.3, s=15, color="#059669")
    ax.axhline(0, color="red", linestyle="--")
    ax.set_xlabel("Prix réel (K MAD)"); ax.set_ylabel("Résidu (K MAD)")
    ax.set_title("Résidus vs Prix réel")

    ax = axes[1, 1]
    try:
        xgb_model = pipeline.named_steps["model"]
        preproc   = pipeline.named_steps["preprocessor"]
        num_bin   = list(preproc.transformers_[0][2])
        cat_enc   = list(preproc.named_transformers_["cat"].get_feature_names_out(
                        preproc.transformers_[1][2]))
        feat_names = num_bin + cat_enc
        importances = xgb_model.feature_importances_
        n   = min(15, len(importances))
        idx = np.argsort(importances)[-n:]
        ax.barh(range(n), importances[idx], color="#d97706")
        ax.set_yticks(range(n))
        ax.set_yticklabels([feat_names[i] for i in idx], fontsize=8)
        ax.set_title("Top 15 importances")
    except Exception as e:
        ax.text(0.5, 0.5, f"Importances indisponibles\n{e}", ha="center", va="center")

    plt.tight_layout()
    if save_dir:
        Path(save_dir).mkdir(parents=True, exist_ok=True)
        fig.savefig(Path(save_dir) / "riad_results.png", dpi=150, bbox_inches="tight")
    plt.show()

# 8. PRÉDICTION UNITAIRE
def predict_price(pipeline, bien_dict: dict, stats: dict) -> dict:
    b = bien_dict.copy()
    if "zone_clean" in b:
        b["zone_clean"] = b["zone_clean"]
    if "titre" in b:
        kws = extract_keywords(b["titre"], b.get("description", ""))
        for k, v in kws.items():
            b.setdefault(k, v)

    city_pm2   = stats.get("city_pm2", 80)
    f_lp       = stats.get("f_lp", np.log(20_000))
    global_bias = stats.get("global_bias", 0.0)

    s   = float(b.get("surface_num", 100))
    q   = str(b.get("zone_clean", "Autre"))
    loc = str(b.get("localisation_fine", "autre_zone"))

    pm2_z = float(stats["z_pm2"].get(q, city_pm2))   if "z_pm2"   in stats else city_pm2
    pm2_l = float(stats["loc_pm2"].get(loc, pm2_z))  if "loc_pm2" in stats else pm2_z

    t = pd.DataFrame([b])
    t["surface_num"]      = s
    t["log_surface"]      = np.log(max(s, 1))
    t["prix_m2"]          = pm2_l
    t["log_prix"]         = np.log(max(s * pm2_l, 1))
    t["log_pm2"]          = np.log(max(pm2_l, 1))
    t["chambres_num"]     = float(b.get("chambres_num", 4))
    t["salles_bain_num"]  = float(b.get("salles_bain_num", 2))
    t["nb_pieces"]        = float(b.get("nb_pieces", t["chambres_num"].iloc[0] + t["salles_bain_num"].iloc[0]))
    t["surface_par_chambre"] = s / max(t["chambres_num"].iloc[0], 1)
    t["ratio_sdb_ch"]     = t["salles_bain_num"] / max(t["chambres_num"].iloc[0], 1)
    t["etage_num"]        = float(b.get("etage_num", 0))
    t["etage_known"]      = int(b.get("etage_known", 0))
    
    for col in ["piscine","parking","ascenseur","terrasse","jardin","climatisation",
                "securite","vue","meuble","neuf","cave","hammam","is_particulier"]:
        t[col] = int(b.get(col, 0))
        
    t["score_standing"]   = t["piscine"]*3 + t["climatisation"]*2 + t["securite"]*2 + t["vue"]*2 + t["neuf"]*2 + t["hammam"]
    t["score_confort"]    = t["parking"] + t["terrasse"] + t["jardin"] + t["meuble"] + t["cave"]
    t["nb_equipements"]   = sum(t[c].iloc[0] for c in ["piscine","parking","terrasse","jardin",
                                "climatisation","securite","vue","meuble","neuf","cave","hammam","ascenseur"])
    t["surf_x_ch"]        = s * t["chambres_num"].iloc[0]
    t["surf_x_standing"]  = s * t["score_standing"].iloc[0]

    # Zone stats
    t["te_log_prix_zone"] = float(stats["z_lp"].get(q, f_lp))   if "z_lp"   in stats else f_lp
    t["te_log_prix_loc"]  = float(stats["loc_lp"].get(loc, f_lp)) if "loc_lp" in stats else f_lp
    t["pm2_median_zone"]  = pm2_z
    t["pm2_median_loc"]   = pm2_l
    t["surface_relative"] = s / float(stats["z_sm"].get(q, s))  if "z_sm" in stats else 1.0
    t["surface_x_loc"]    = s * pm2_l / 1e3
    prix_est              = s * pm2_l
    t["log_prix_estime"]  = np.log(max(prix_est, 1))
    t["zone_bias"]        = float(stats["z_bias_map"].get(q, global_bias)) if "z_bias_map" in stats else 0.0

    t["segment_prix"] = ("eco"     if prix_est < 10_000  else
                         "mid"     if prix_est < 30_000 else
                         "premium" if prix_est < 80_000 else "ultra")
    t["cat_surface"]  = ("tiny"   if s < 80  else "small"  if s < 150 else
                         "medium" if s < 250 else "large"  if s < 400 else "estate")
    t["localisation_fine"] = loc

    for col in ["kw_hote", "kw_renove", "kw_patio", "kw_bassin", "kw_acces",
                "kw_titre", "kw_hammam", "kw_toit"]:
        t[col] = int(b.get(col, 0))

    # Aligner sur les colonnes du pipeline
    feat_cols = stats.get("feature_cols", [])
    for col in feat_cols:
        if col not in t.columns:
            t[col] = 0
    if feat_cols:
        t = t[feat_cols]

    log_pred  = pipeline.predict(t)[0]
    prix_point = float(np.exp(log_pred))
    pm2_pred   = prix_point / s
    mode       = stats.get("mode", "point")
    margin     = 0.30 if mode == "range" else None

    result = {
        "mode":        mode,
        "prix_estime": round(prix_point, -3),
        "pm2_estime":  round(pm2_pred, -2),
        "surface":     s,
        "prix_point":  prix_point,
    }
    if margin:
        result["prix_min"] = round(prix_point * (1 - margin), -3)
        result["prix_max"] = round(prix_point * (1 + margin), -3)

    print(f"\n Riad — {s:.0f} m² | {q}")
    print(f"   Prix estimé : {result['prix_estime']:,.0f} MAD")
    print(f"   Prix/m²     : {result['pm2_estime']:,.0f} MAD/m²")
    return result

# 9. PIPELINE COMPLET
def run_pipeline(tune=True, n_trials=150):
    print("\n" + "═" * 60)
    print("  PIPELINE RIAD LOCATION")
    print("═" * 60)

    df = load_data()
    print("\n Split train/test...")
    X_train, X_test, y_train, y_test, df_train, df_test, stats = split_and_encode(df)

    xgb_params, study = tune_hyperparams(X_train, y_train, stats, n_trials) if tune else (None, None)

    pipeline_final = build_pipeline(stats, xgb_params)
    pipeline_final = train(pipeline_final, X_train, y_train)

    metrics = evaluate(pipeline_final, X_test, y_test, df_test, X_train, y_train)
    stats["mode"] = metrics.get("mode", "point")

    plot_results(pipeline_final, X_test, df_test, metrics)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline_final, "stats": stats}, MODEL_PATH)
    print(f"\n Modèle sauvegardé : {MODEL_PATH}")

    return pipeline_final, stats, metrics, study

if __name__ == "__main__":
    pipeline_final, stats, metrics, study = run_pipeline(tune=True, n_trials=50)
