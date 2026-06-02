
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


# 
# CONSTANTES
# 

NUMERIC_FEATURES = [
    # Surface
    "surface_num", "log_surface", "surface_par_chambre", "ratio_ch_surface",
    # Pièces
    "chambres_num", "salles_bain_num",
    # Etage
    "etage", "etage_known",
    # Standing
    "score_standing", "score_exterieur", "nb_equipements", "standing_premium",
    # Interactions
    "surf_x_piscine", "surf_x_standing",
    # NLP texte
    "text_standing_score", "kw_standing", "kw_architecte", "kw_jardin", "kw_renove",
    # Groupby (calculées dans split_and_encode sur train uniquement)
    "surface_x_quartier", "pm2_moy_quartier", "surface_relative",
    "pm2_median_loc", "surface_x_loc", "surface_rel_loc",
    "log_prix_estime",          # prix_estime supprimé (redondant — même info en log)
    # Target encoding + biais zone
    "te_log_prix_quartier", "te_log_prix_loc",
    "zone_bias",                # résidu moyen par zone sur train → corrige sous-estimation
]

BINARY_FEATURES = [
    "piscine", "parking", "ascenseur", "terrasse", "jardin",
    "climatisation", "securite", "vue", "meuble", "neuf", "cave", "hammam",
    "kw_projet",
]

CATEGORICAL_FEATURES = [
    "quartier_clean",
    "localisation_fine",
    "cat_surface",
    "segment_prix",     # <2M / 2-5M / 5-15M / >15M — estimé à partir du pm²
]

TARGET_LOG  = "log_prix"
TARGET_RAW  = "prix_num"
EUR_TO_MAD  = 10.8


# 
# 1. CHARGEMENT & CLEANING
# 

def load_data(path: str) -> pd.DataFrame:
    """
    Charge, nettoie et enrichit le CSV villas.

    Retourne : df avec toutes les features de base (sans groupby).
    Les features groupby sont calculées dans split_and_encode().
    """
    df = pd.read_csv(path)
    print(f"Brut : {df.shape}")

    # Déduplication sur contenu (pas sur id — id souvent dupliqué)
    df = df.drop_duplicates(
        subset=["prix_num", "surface_num", "localisation", "chambres_num"]
    ).copy()
    print(f"Après dédup contenu : {df.shape}")

    # EUR → MAD
    eur_mask = df["prix"].str.contains("EUR", na=False)
    df.loc[eur_mask, "prix_num"] = df.loc[eur_mask, "prix_num"] * EUR_TO_MAD
    print(f"EUR → MAD : {eur_mask.sum()} lignes")

    # Filtres cleaning
    df = df[df["prix_num"].notna() & (df["prix_num"] > 0)].copy()
    df = df[
        df["surface_num"].notna() &
        (df["surface_num"] >= 10) &
        (df["surface_num"] <= 3000)
    ].copy()

    df["_ppm2"] = df["prix_num"] / df["surface_num"]
    df = df[(df["_ppm2"] >= 10) & (df["_ppm2"] <= 2_000)].copy()
    df.drop(columns=["_ppm2"], inplace=True)

    df = df[df["prix_num"] >= 5_000].copy()   # <2M MAPE=64% → monter le seuil réduit le bruit

    log_prix = np.log(df["prix_num"])
    df = df[
        (log_prix >= log_prix.quantile(0.01)) &
        (log_prix <= log_prix.quantile(0.99))
    ].copy()

    # Etage
    df["etage"] = df["etage"].replace(-1, np.nan)
    df["etage_known"] = df["etage"].notna().astype(int)
    df["etage"] = df["etage"].fillna(-99)

    # Chambres
    df["chambres_num"] = df["chambres_num"].replace(0, np.nan)
    df.loc[df["chambres_num"] > 15, "chambres_num"] = np.nan
    df["chambres_num"] = df["chambres_num"].fillna(df["chambres_num"].median())

    # Salles de bain
    df["salles_bain_num"] = df["salles_bain_num"].fillna(df["salles_bain_num"].median())

    # ── NLP keywords (depuis description + titre) ─────────────────────────
    df["desc"] = (df["description"].fillna("") + " " + df["titre"].fillna("")).str.lower()

    keywords = {
        "kw_standing"  : r"standing|luxe|luxueux|haut de gamme|prestige|exception|premium|raffiné",
        "kw_renove"    : r"rénov|réhabilit|refait|neuf|moderne|contemporain|récent",
        "kw_architecte": r"architecte|design|signé|contemporain|concept",
        "kw_jardin"    : r"jardin (aménagé|arboré|paysagé|verdoyant)|parc|espace vert",
        "kw_projet"    : r"projet|sur plan|en cours|livraison|promotion",
    }
    for feat, pattern in keywords.items():
        df[feat] = df["desc"].str.contains(pattern, regex=True, na=False).astype(int)

    df["text_standing_score"] = df[[
        "kw_standing", "kw_renove", "kw_architecte", "kw_jardin"
    ]].sum(axis=1)

    df.drop(columns=["desc"], inplace=True)

    # ── Features de base (sans groupby) ──────────────────────────────────
    # Zones : garder celles avec >= 30 lignes, sinon merger par axe géographique
    q_counts = df["quartier"].value_counts()
    top_q = q_counts[q_counts >= 30].index
    ZONE_MERGE = {
        "Médina": "Autre_centre", "Hivernage": "Autre_centre",
        "Daoudiate": "Autre_centre",
        "Route d'Amizmiz": "Autre_périphérie",
        "Route de Casablanca": "Autre_périphérie",
    }
    def _clean_quartier(x):
        if x in top_q:
            return x
        if x in ZONE_MERGE:
            return ZONE_MERGE[x]
        return "Autre"
    df["quartier_clean"] = df["quartier"].apply(_clean_quartier)

    df["localisation_fine"] = (
        df["localisation"].str.split(",").str[0].str.strip().str.lower()
        .str.replace(r"[^a-zàâäéèêëîïôùûü '\-]", "", regex=True)
    )
    counts = df["localisation_fine"].value_counts()
    df["localisation_fine"] = df["localisation_fine"].apply(
        lambda x: x if x in counts[counts >= 8].index else "autre_zone"
    )

    df["surface_par_chambre"] = df["surface_num"] / df["chambres_num"].clip(lower=1)
    df["score_standing"]      = (
        df["piscine"] + df["hammam"] + df["climatisation"] +
        df["securite"] + df["vue"]
    )
    df["score_exterieur"]     = df["terrasse"] + df["jardin"] + df["piscine"]
    df["nb_equipements"]      = df[[
        "piscine", "parking", "ascenseur", "terrasse", "jardin",
        "climatisation", "securite", "vue", "cave", "hammam"
    ]].sum(axis=1)
    df["standing_premium"]    = (
        df["piscine"] * 3 + df["hammam"] * 2 + df["securite"] +
        df["vue"] * 2 + df["climatisation"]
    )
    df["ratio_ch_surface"]    = df["chambres_num"] / df["surface_num"].clip(lower=1)

    df["cat_surface"] = pd.cut(
        df["surface_num"],
        bins=[0, 200, 350, 500, 800, 1500, 9999],
        labels=["tiny", "small", "medium", "large", "xlarge", "estate"]
    ).astype(str)

    df["log_surface"]    = np.log(df["surface_num"])
    # Segment prix — permet au modèle d'apprendre des relations différentes par gamme
    df["segment_prix"] = pd.cut(
        df["prix_num"],
        bins=[0, 15_000, 30_000, 60_000, 1e12],
        labels=["eco", "mid", "premium", "ultra"]
    ).astype(str)
    df["surf_x_piscine"]  = df["surface_num"] * df["piscine"]
    df["surf_x_standing"] = df["surface_num"] * df["score_standing"]
    df["log_prix"] = np.log(df["prix_num"])

    print(f" Shape finale : {df.shape}")
    print(f"   Prix médian  : {df['prix_num'].median():,.0f} MAD")
    print(f"   Zones        : {df['localisation_fine'].nunique()}")
    return df


# 
# 2. SPLIT + FEATURES GROUPBY (sans leakage)
# 

def split_and_encode(df, test_size: float = 0.2, random_state: int = 42):
  
    # Toutes les features calculées dans _enrich (pas encore dans df)
    GROUPBY_FEATURES = {
        "surface_x_quartier", "prix_m2_moy_quartier", "pm2_moy_quartier",
        "surface_relative", "loc_prix_m2_median", "pm2_median_loc",
        "surface_x_loc", "surface_rel_loc", "prix_estime", "log_prix_estime",
        "te_log_prix_quartier", "te_log_prix_loc",
        "zone_bias",
        "segment_prix",   # recalculé sur prix_estime pour éviter leakage sur test
    }
    BASE_FEATURES = (
        [c for c in NUMERIC_FEATURES if c not in GROUPBY_FEATURES]
        + BINARY_FEATURES + CATEGORICAL_FEATURES
    )

    X_base = df[BASE_FEATURES].copy()
    y      = df[TARGET_LOG].copy()

    idx_tr, idx_te = train_test_split(
        df.index, test_size=test_size, random_state=random_state
    )
    df_train = df.loc[idx_tr].copy()
    df_test  = df.loc[idx_te].copy()

    X_tr_base = X_base.loc[idx_tr].copy()
    X_te_base = X_base.loc[idx_te].copy()
    y_train   = y.loc[idx_tr].copy()
    y_test    = y.loc[idx_te].copy()

    # Stats calculées sur train uniquement (sans leakage)
    df_train["_pm2"] = df_train["prix_num"] / df_train["surface_num"]

    q_pm2_med = df_train.groupby("quartier_clean")["_pm2"].median()   # pm²  médian / quartier
    q_pm2_moy = df_train.groupby("quartier_clean")["_pm2"].mean()     # pm²  moyen  / quartier
    q_sm      = df_train.groupby("quartier_clean")["surface_num"].mean()
    q_lp      = df_train.groupby("quartier_clean")["log_prix"].mean()  # target encoding

    l_pm2_med = df_train.groupby("localisation_fine")["_pm2"].median()
    l_sm      = df_train.groupby("localisation_fine")["surface_num"].mean()
    l_lp      = df_train.groupby("localisation_fine")["log_prix"].mean()  # target encoding

    fp        = df_train["prix_num"].median()
    fs        = df_train["surface_num"].mean()
    f_lp      = df_train["log_prix"].mean()
    city_pm2  = df_train["_pm2"].mean()
    df_train.drop(columns=["_pm2"], inplace=True)

    # Zone bias : résidu moyen de log_prix_estime vs log_prix réel sur train
    # Capture la sous/sur-estimation systématique par zone
    _pm2_loc_tr = df_train["localisation_fine"].map(l_pm2_med).fillna(city_pm2)
    _lpe_tr     = np.log((df_train["surface_num"] * _pm2_loc_tr).clip(lower=1))
    _resid_tr   = df_train["log_prix"].values - _lpe_tr.values
    zone_bias_map = pd.Series(_resid_tr, index=df_train.index).groupby(
        df_train["quartier_clean"]
    ).mean()
    global_bias = float(np.mean(_resid_tr))

    stats = dict(
        q_pm2_med=q_pm2_med, q_pm2_moy=q_pm2_moy, q_sm=q_sm, q_lp=q_lp,
        l_pm2_med=l_pm2_med, l_sm=l_sm, l_lp=l_lp,
        fp=fp, fs=fs, f_lp=f_lp, city_pm2=city_pm2,
        zone_bias_map=zone_bias_map, global_bias=global_bias,
        # aliases rétrocompat predict_price
        q_pm=q_pm2_med * fs, q_pa=q_pm2_moy * fs, l_pm=l_pm2_med * fs,
    )

    def _enrich(X, src_df):
        X    = X.copy()
        surf = src_df.loc[X.index, "surface_num"]

        pm2_q  = X["quartier_clean"].map(q_pm2_med).fillna(city_pm2)
        pm2_l  = X["localisation_fine"].map(l_pm2_med).fillna(city_pm2)

        X["surface_x_quartier"]    = surf * pm2_q / 1e6
        X["pm2_moy_quartier"]      = X["quartier_clean"].map(q_pm2_moy).fillna(city_pm2)
        X["surface_relative"]      = surf / X["quartier_clean"].map(q_sm).fillna(fs)
        X["pm2_median_loc"]        = pm2_l
        X["surface_x_loc"]         = surf * pm2_l / 1e6
        X["surface_rel_loc"]       = surf / X["localisation_fine"].map(l_sm).fillna(fs)
        X["prix_estime"]           = surf * pm2_l
        X["log_prix_estime"]       = np.log(X["prix_estime"].clip(lower=1))
        # Target encoding log_prix (sans leakage : stats calculées sur train)
        X["te_log_prix_quartier"]  = X["quartier_clean"].map(q_lp).fillna(f_lp)
        X["te_log_prix_loc"]       = X["localisation_fine"].map(l_lp).fillna(f_lp)
        X["zone_bias"]             = X["quartier_clean"].map(zone_bias_map).fillna(global_bias)
        # segment_prix : sur train → valeur réelle du df ; sur test → estimé depuis prix_estime
        if "segment_prix" in src_df.columns:
            X["segment_prix"] = src_df.loc[X.index, "segment_prix"].values
        else:
            prix_est = X["prix_estime"] if "prix_estime" in X.columns else surf * pm2_l
            X["segment_prix"] = pd.cut(
                prix_est,
                bins=[0, 15_000, 30_000, 60_000, 1e12],
                labels=["eco", "mid", "premium", "ultra"]
            ).astype(str).fillna("mid")
        # Alias rétrocompat
        X["loc_prix_m2_median"]    = pm2_l
        X["prix_m2_moy_quartier"]  = X["pm2_moy_quartier"]
        return X

    X_train = _enrich(X_tr_base, df_train)
    X_test  = _enrich(X_te_base, df_test)

    all_feats = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES
    missing = [f for f in all_feats if f not in X_train.columns]
    if missing:
        raise ValueError(f"Features manquantes : {missing}")

    X_train = X_train[all_feats]
    X_test  = X_test[all_feats]

    print(f" Split — Train : {len(X_train)} | Test : {len(X_test)} | Features : {len(all_feats)}")
    return X_train, X_test, y_train, y_test, df_train, df_test, stats


# 
# 3. PIPELINE SKLEARN
# 

def build_pipeline(X_train, xgb_params: dict = None):
    num_cols = [c for c in NUMERIC_FEATURES    if c in X_train.columns]
    bin_cols = [c for c in BINARY_FEATURES     if c in X_train.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_train.columns]

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(),                                num_cols),
        ("bin", "passthrough",                                   bin_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore",
                              sparse_output=False),              cat_cols),
    ], remainder="drop")

    default_xgb = dict(
        n_estimators     = 1800,
        learning_rate    = 0.015,
        max_depth        = 5,
        subsample        = 0.65,
        colsample_bytree = 0.90,
        min_child_weight = 6,
        reg_alpha        = 0.001,
        reg_lambda       = 0.15,
        gamma            = 0.05,
        tree_method      = "hist",
        random_state     = 42,
        n_jobs           = -1,
    )
    if xgb_params:
        default_xgb.update(xgb_params)

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", XGBRegressor(**default_xgb)),
    ])
    print(f" Pipeline — num:{len(num_cols)} bin:{len(bin_cols)} cat:{len(cat_cols)}")
    return pipeline


# 
# 4. ENTRAÎNEMENT
# 

def train(pipeline, X_train, y_train):
    pipeline.fit(X_train, y_train)
    print( "Entraînement terminé (cible = log prix)")
    return pipeline


# 
# 5. ÉVALUATION
# 

def evaluate(pipeline, X_test, y_test, X_train=None, y_train=None, cv_folds: int = 5):
    """
    Métriques sur le test en MAD.
    CV calculée sur X_train (pas X_test) si fourni.
    """
    y_pred_mad = np.exp(pipeline.predict(X_test))
    y_true_mad = np.exp(y_test.values)

    mae  = mean_absolute_error(y_true_mad, y_pred_mad)
    rmse = np.sqrt(mean_squared_error(y_true_mad, y_pred_mad))
    r2   = r2_score(y_true_mad, y_pred_mad)
    mape = np.mean(np.abs((y_true_mad - y_pred_mad) / y_true_mad)) * 100

    cv_X = X_train if X_train is not None else X_test
    cv_y = y_train if y_train is not None else y_test
    kf   = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_r2 = cross_val_score(pipeline, cv_X, cv_y, cv=kf, scoring="r2")

    metrics = {
        "R²": r2, "MAE (MAD)": mae, "RMSE (MAD)": rmse,
        "MAPE (%)": mape, "CV R² (mean)": cv_r2.mean(), "CV R² (std)": cv_r2.std(),
    }

    print("\n" + "═" * 45)
    print("  MÉTRIQUES — VILLA LOCATION v2")
    print("═" * 45)
    print(f"  MAE              : {mae:>15,.0f} MAD")
    print(f"  RMSE             : {rmse:>15,.0f} MAD")
    print(f"  R²               : {r2:>15.4f}")
    print(f"  MAPE             : {mape:>14.2f} %")
    print(f"  CV R² ({cv_folds} folds)  : {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
    print("═" * 45)
    return metrics


# 
# 6. VISUALISATIONS
# 

def plot_results(pipeline, X_test, y_test):
    y_pred_mad = np.exp(pipeline.predict(X_test))
    y_true_mad = np.exp(y_test.values)
    residuals  = y_true_mad - y_pred_mad

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Évaluation XGBoost — Prix Villas Marrakech v2",
                 fontsize=14, fontweight="bold", y=1.01)

    ax = axes[0, 0]
    ax.scatter(y_true_mad/1e3, y_pred_mad/1e3, alpha=0.4, s=15, color="#2563EB")
    lims = [min(y_true_mad.min(), y_pred_mad.min())/1e3,
            max(y_true_mad.max(), y_pred_mad.max())/1e3]
    ax.plot(lims, lims, "r--", lw=1.5, label="Parfait"); ax.legend()
    ax.set_xlabel("Prix réel (K MAD)"); ax.set_ylabel("Prix prédit (K MAD)")
    ax.set_title("Prédictions vs Réel"); ax.grid(True, alpha=0.3)

    ax = axes[0, 1]
    ax.hist(residuals/1e3, bins=60, color="#10B981", edgecolor="white", lw=0.5)
    ax.axvline(0, color="red", ls="--", lw=1.5)
    ax.set_xlabel("Résidu (K MAD)"); ax.set_title("Distribution résidus")
    ax.grid(True, alpha=0.3)

    ax = axes[1, 0]
    ax.scatter(y_pred_mad/1e3, residuals/1e3, alpha=0.4, s=15, color="#F59E0B")
    ax.axhline(0, color="red", ls="--", lw=1.5)
    ax.set_xlabel("Prix prédit (K MAD)"); ax.set_ylabel("Résidu (K MAD)")
    ax.set_title("Résidus vs Prédictions"); ax.grid(True, alpha=0.3)

    ax = axes[1, 1]
    pre = pipeline.named_steps["preprocessor"]
    mdl = pipeline.named_steps["model"]
    try:
        fn = (list(pre.transformers_[0][2]) + list(pre.transformers_[1][2]) +
              list(pre.transformers_[2][1].get_feature_names_out(CATEGORICAL_FEATURES)))
    except Exception:
        fn = [f"f{i}" for i in range(mdl.n_features_in_)]
    imp = mdl.feature_importances_
    top = min(15, len(fn)); idx = np.argsort(imp)[-top:]
    ax.barh([fn[i] for i in idx], imp[idx], color="#6366F1")
    ax.set_xlabel("Importance"); ax.set_title(f"Top {top} Features")
    ax.grid(True, alpha=0.3, axis="x")

    plt.tight_layout()
    plt.savefig("villa_model_v2_evaluation.png", dpi=150, bbox_inches="tight")
    plt.show()
    print(" villa_model_evaluation.png")


# 
# 7. PRÉDICTION
# 

def predict_price(pipeline, villa: dict, stats: dict) -> float:
   
    t = villa.copy()

    # Defaults
    for col in BINARY_FEATURES:
        t.setdefault(col, 0)
    t.setdefault("etage", 0); t.setdefault("etage_known", 1)
    t.setdefault("cat_surface", "medium")

    # Features dérivées
    t["surface_par_chambre"] = t["surface_num"] / max(t.get("chambres_num", 1), 1)
    t["score_standing"]      = sum(t.get(k, 0) for k in ["piscine","hammam","climatisation","securite","vue"])
    t["score_exterieur"]     = sum(t.get(k, 0) for k in ["terrasse","jardin","piscine"])
    t["nb_equipements"]      = sum(t.get(k, 0) for k in ["piscine","parking","ascenseur","terrasse","jardin","climatisation","securite","vue","cave","hammam"])
    t["standing_premium"]    = t.get("piscine",0)*3 + t.get("hammam",0)*2 + t.get("securite",0) + t.get("vue",0)*2 + t.get("climatisation",0)
    t["ratio_ch_surface"]    = t.get("chambres_num", 1) / max(t["surface_num"], 1)
    t["text_standing_score"] = 0
    for k in ["kw_standing","kw_renove","kw_architecte","kw_jardin"]:
        t[k] = t.get(k, 0)
        t["text_standing_score"] += t[k]
    t.setdefault("kw_projet", 0)

    # Groupby features
    s    = t["surface_num"]
    q    = t.get("quartier_clean", "Autre")
    loc  = t.get("localisation_fine", "autre_zone")
    city_pm2 = stats.get("city_pm2", stats["fp"] / stats["fs"])
    f_lp     = stats.get("f_lp", np.log(stats["fp"]))

    pm2_q = stats["q_pm2_med"].get(q, city_pm2)   if "q_pm2_med" in stats else stats["q_pm"].get(q, stats["fp"]) / stats["fs"]
    pm2_l = stats["l_pm2_med"].get(loc, city_pm2) if "l_pm2_med" in stats else stats["l_pm"].get(loc, stats["fp"]) / stats["fs"]
    q_sm  = stats["q_sm"].get(q,   stats["fs"])
    l_sm  = stats["l_sm"].get(loc, stats["fs"])

    t["surface_x_quartier"]   = s * pm2_q / 1e6
    t["pm2_moy_quartier"]     = stats["q_pm2_moy"].get(q, city_pm2) if "q_pm2_moy" in stats else pm2_q
    t["prix_m2_moy_quartier"] = t["pm2_moy_quartier"]
    t["surface_relative"]     = s / q_sm
    t["pm2_median_loc"]       = pm2_l
    t["loc_prix_m2_median"]   = pm2_l
    t["surface_x_loc"]        = s * pm2_l / 1e6
    t["surface_rel_loc"]      = s / l_sm
    t["prix_estime"]          = s * pm2_l
    t["log_prix_estime"]      = np.log(max(t["prix_estime"], 1))
    t["te_log_prix_quartier"] = stats["q_lp"].get(q, f_lp)   if "q_lp" in stats else f_lp
    t["te_log_prix_loc"]      = stats["l_lp"].get(loc, f_lp) if "l_lp" in stats else f_lp
    t["zone_bias"]            = stats["zone_bias_map"].get(q, stats.get("global_bias", 0.0)) if "zone_bias_map" in stats else 0.0
    t["log_surface"]          = np.log(max(s, 1))
    t["surf_x_piscine"]       = s * t.get("piscine", 0)
    t["surf_x_standing"]      = s * t.get("score_standing", 0)
    # segment_prix depuis prix_estime
    pe = t.get("prix_estime", s * pm2_l)
    t["segment_prix"] = ("eco" if pe < 15e3 else
                         "mid" if pe < 30e3 else
                         "premium" if pe < 60e3 else "ultra")

    all_feats = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES
    df_in = pd.DataFrame([t])
    for col in all_feats:
        if col not in df_in.columns:
            df_in[col] = 0

    prix_mad = np.exp(pipeline.predict(df_in[all_feats])[0])
    print(f" Villa {s} m² | {q} | Prix estimé : {prix_mad:,.0f} MAD ({prix_mad/10.8:,.0f} EUR)")
    print(f"   ≈ {prix_mad/s:,.0f} MAD/m²")
    return prix_mad