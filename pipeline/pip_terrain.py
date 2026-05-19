"""
pip_terrain.py
==============
Pipeline d'entraînement et de prédiction — Terrains Vente Marrakech
Adapté depuis pip_appartement.py avec features spécifiques aux terrains.
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from xgboost import XGBRegressor


# ══════════════════════════════════════════════════════════════════════════
# CONSTANTES
# ══════════════════════════════════════════════════════════════════════════

NUMERIC_FEATURES = [
    "surface_num",            # Surface brute du terrain (m²)
    "log_surface",            # Log(surface) — distribution très étalée pour terrains
    "log_surface_sq",         # Log(surface)² — terme quadratique pour non-linéarité
    "palier_surface",         # Catégorie de taille (0–5)
    "surface_relative",       # Surface vs moyenne du quartier
    "residuel_surface",       # Déviation absolue vs médiane quartier
    "surface_x_quartier",     # Interaction surface × prix médian quartier
    "surface_log_x_pm2",      # Interaction log_surface × prix/m² quartier
    "prix_m2_moy_quartier",   # Prix/m² moyen dans le quartier
    "prix_m2_std_quartier",   # Écart-type prix/m² dans le quartier (variance territoriale)
    "prix_median_quartier",   # Prix médian du quartier
    "prix_estime",            # surface × prix_m2_moy (estimation directe du prix)
    "log_prix_estime",        # log de l'estimation directe → très proche de la cible
    "nb_listings_quartier",   # Liquidité / confiance du quartier
    "km_distance",            # Distance en km depuis titre/localisation (0 si inconnu)
    "ratio_pm2_city",         # Prix/m² quartier / moyenne ville (position relative dans le marché)
    "km_x_log_surface",       # Interaction distance × log_surface (crucial pour les Routes)
    "score_terrain",          # Score équipements spécifiques terrain
    "score_standing",         # Score équipements standing général
    "nb_equipements",         # Nb total équipements
    # Maintenus pour compatibilité interface (valeur 0 pour terrains)
    "chambres_num",
    "salles_bain_num",
    "etage",
    "etage_known",
    "surface_par_chambre",
]

BINARY_FEATURES = [
    "piscine", "parking", "jardin", "securite", "vue",
    "terrasse", "neuf", "meuble", "climatisation", "hammam", "cave", "ascenseur",
    "is_particulier",   # Particulier vs professionnel
    "is_industriel",    # Terrain industriel (+0.82 log_prix)
    "is_lotissement",   # Terrain lotissement (-0.31 log_prix)
    "is_agricole",      # Terrain agricole (+0.22 log_prix)
    "is_zone_villa",    # Zone villa (+0.18 log_prix)
]

CATEGORICAL_FEATURES = [
    "quartier_clean",
    "source_clean",     # Plateforme de scraping (avito/sarouty/agenz/promoimmo)
]

TARGET_RAW = "prix_num"
TARGET_LOG = "log_prix"

# Seuils de cleaning adaptés aux terrains Marrakech
SURFACE_MIN = 50           # m²
SURFACE_MAX = 500_000      # m²
PRIX_M2_MIN = 50           # MAD/m²
PRIX_M2_MAX = 50_000       # MAD/m²
EUR_TO_MAD  = 10.8


# ══════════════════════════════════════════════════════════════════════════
# 1. CHARGEMENT & CLEANING
# ══════════════════════════════════════════════════════════════════════════

def load_data(path: str):
    """
    Charge le CSV terrain, applique le cleaning et le feature engineering.
    Retourne (df_full, X, y).
    """
    df = pd.read_csv(path)

    # ── Filtrage type de bien ────────────────────────────────────────────
    terrain_types = ["Terrain", "Vente Terrain"]
    if "type_bien" in df.columns:
        before = len(df)
        df = df[df["type_bien"].isin(terrain_types)].copy()
        print(f"  Filtre terrain : {len(df)} / {before} lignes conservées")

    # ── Conversion EUR → MAD ────────────────────────────────────────────
    if "prix" in df.columns:
        eur_mask = df["prix"].str.contains("EUR", na=False)
        df.loc[eur_mask, "prix_num"] = df.loc[eur_mask, "prix_num"] * EUR_TO_MAD

    # ── Suppression lignes sans target ──────────────────────────────────
    df = df[df["prix_num"].notna() & (df["prix_num"] > 0)].copy()

    # ── Filtrage surface ─────────────────────────────────────────────────
    df = df[
        df["surface_num"].notna() &
        (df["surface_num"] >= SURFACE_MIN) &
        (df["surface_num"] <= SURFACE_MAX)
    ].copy()

    # ── Filtrage prix/m² ─────────────────────────────────────────────────
    df["_pm2"] = df["prix_num"] / df["surface_num"]
    df = df[(df["_pm2"] >= PRIX_M2_MIN) & (df["_pm2"] <= PRIX_M2_MAX)].copy()
    df.drop(columns=["_pm2"], inplace=True)

    # ── Outliers prix (log-échelle, percentile 2-98) — filtrage renforcé
    log_p = np.log(df["prix_num"])
    df = df[(log_p >= log_p.quantile(0.02)) & (log_p <= log_p.quantile(0.98))].copy()

    # ── Colonnes non pertinentes pour terrain ────────────────────────────
    df["etage"]          = 0
    df["etage_known"]    = 0
    df["chambres_num"]   = 0
    df["salles_bain_num"] = 0

    # ── Source (plateforme de scraping) ─────────────────────────────────
    if "source" in df.columns:
        top_sources = df["source"].value_counts().index[:5].tolist()
        df["source_clean"] = df["source"].apply(lambda x: x if x in top_sources else "autre_src")
    else:
        df["source_clean"] = "inconnu"

    # ── Agence type (Particulier vs Professionnel) ─────────────────────────
    if "agence" in df.columns:
        df["is_particulier"] = df["agence"].str.lower().str.contains("particulier", na=False).astype(int)
    else:
        df["is_particulier"] = 0

    # ── Reconstruction quartier_clean ────────────────────────────────────
    if "quartier_clean" not in df.columns:
        if "quartier" in df.columns:
            top_q = df["quartier"].value_counts().index[:15]
            df["quartier_clean"] = df["quartier"].apply(
                lambda x: x if x in top_q else "Autre"
            )
        else:
            raise ValueError("Aucune colonne quartier trouvée dans le CSV.")

    # ── Keywords NLP — type de terrain (titre + description) ──────────────────
    import re
    def kw_flag(col, pattern):
        if col not in df.columns:
            return 0
        return df[col].str.lower().str.contains(pattern, na=False, regex=False).astype(int)

    df["is_industriel"] = kw_flag("titre", "industriel") | kw_flag("description", "industriel")
    df["is_lotissement"] = kw_flag("titre", "lotissement") | kw_flag("description", "lotissement")
    df["is_agricole"]   = kw_flag("titre", "agricole")   | kw_flag("description", "agricole")
    df["is_zone_villa"] = kw_flag("titre", "zone villa")  | kw_flag("description", "zone villa")

    def extract_km(text):
        if pd.isna(text): return 0
        m = re.search(r"km\s*(\d+)", str(text).lower())
        return int(m.group(1)) if m else 0

    df["km_distance"] = df["titre"].apply(extract_km)
    mask_no_km = df["km_distance"] == 0
    if "localisation" in df.columns:
        df.loc[mask_no_km, "km_distance"] = df.loc[mask_no_km, "localisation"].apply(extract_km)

    # ── Feature Engineering numérique ────────────────────────────────
    q_median = df.groupby("quartier_clean")["prix_num"].transform("median")
    q_pm2    = df.groupby("quartier_clean").apply(
        lambda g: (g["prix_num"] / g["surface_num"]).mean()
    ).rename("_pm2q")
    df = df.join(q_pm2, on="quartier_clean")
    df.rename(columns={"_pm2q": "prix_m2_moy_quartier"}, inplace=True)

    # Écart-type prix/m² par quartier (signal de variance territoriale)
    q_pm2_std = df.groupby("quartier_clean").apply(
        lambda g: (g["prix_num"] / g["surface_num"]).std()
    ).rename("_pm2std")
    df = df.join(q_pm2_std, on="quartier_clean")
    df.rename(columns={"_pm2std": "prix_m2_std_quartier"}, inplace=True)
    df["prix_m2_std_quartier"].fillna(0, inplace=True)

    df["prix_median_quartier"] = q_median
    df["surface_x_quartier"]   = df["surface_num"] * q_median / 1e6
    df["surface_relative"]     = df["surface_num"] / df.groupby("quartier_clean")["surface_num"].transform("mean")
    df["residuel_surface"]     = df["surface_num"] - df.groupby("quartier_clean")["surface_num"].transform("median")
    df["log_surface"]          = np.log1p(df["surface_num"])
    df["log_surface_sq"]       = df["log_surface"] ** 2   # terme quadratique
    df["surface_log_x_pm2"]    = df["log_surface"] * df["prix_m2_moy_quartier"] / 1e3  # interaction
    df["prix_estime"]          = df["surface_num"] * df["prix_m2_moy_quartier"]
    df["log_prix_estime"]      = np.log1p(df["prix_estime"])  # ≈ cible, signal très fort
    df["nb_listings_quartier"] = df.groupby("quartier_clean")["prix_num"].transform("count")

    # Ratio prix/m² quartier vs ville (position relative dans le marché)
    city_pm2 = df["prix_num"].sum() / df["surface_num"].sum()
    df["ratio_pm2_city"]    = df["prix_m2_moy_quartier"] / city_pm2
    df["km_x_log_surface"]  = df["km_distance"] * df["log_surface"]
    df["palier_surface"]       = pd.cut(
        df["surface_num"],
        bins=[0, 200, 500, 1000, 5000, 20000, np.inf],
        labels=[0, 1, 2, 3, 4, 5]
    ).astype(int)
    df["score_terrain"]        = df[["piscine","jardin","securite","vue","parking"]].sum(axis=1)
    df["score_standing"]       = df[["piscine","terrasse","vue","hammam","climatisation","securite"]].sum(axis=1)
    df["nb_equipements"]       = df[["piscine","parking","ascenseur","terrasse","jardin",
                                     "climatisation","securite","vue","cave","hammam"]].sum(axis=1)
    df["surface_par_chambre"]  = df["surface_num"]   # alias pour compatibilité

    if TARGET_LOG not in df.columns:
        df[TARGET_LOG] = np.log(df[TARGET_RAW])

    # ── Vérification finale ──────────────────────────────────────────────
    all_features = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES
    missing = [f for f in all_features if f not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes dans le CSV : {missing}")

    X = df[all_features].copy()
    y = df[TARGET_LOG].copy()

    print(f"✅ Données chargées — X : {X.shape}  |  y : {y.shape}")
    return df, X, y


# ══════════════════════════════════════════════════════════════════════════
# 2. SPLIT TRAIN / TEST
# ══════════════════════════════════════════════════════════════════════════

def split_data(X, y, test_size: float = 0.2, random_state: int = 42):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    print(f"✅ Split — Train : {X_train.shape[0]} lignes | Test : {X_test.shape[0]} lignes")
    return X_train, X_test, y_train, y_test


# ══════════════════════════════════════════════════════════════════════════
# 3. PIPELINE SKLEARN
# ══════════════════════════════════════════════════════════════════════════

def build_pipeline(X_train, xgb_params: dict = None):
    """
    Construit le pipeline sklearn (preprocessor + XGBRegressor).
    Les paramètres par défaut sont calibrés pour les terrains Marrakech.
    """
    num_cols = [c for c in NUMERIC_FEATURES     if c in X_train.columns]
    bin_cols = [c for c in BINARY_FEATURES      if c in X_train.columns]
    cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_train.columns]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(),                               num_cols),
            ("bin", "passthrough",                                  bin_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore",
                                  sparse_output=False),             cat_cols),
        ],
        remainder="drop",
    )

    # Paramètres par défaut optimisés pour terrains (log-prix, forte variance)
    default_xgb = dict(
        n_estimators      = 1500,
        learning_rate     = 0.01,
        max_depth         = 6,
        max_leaves        = 31,
        subsample         = 0.75,
        colsample_bytree  = 0.80,
        min_child_weight  = 3,
        reg_alpha         = 0.05,
        reg_lambda        = 0.1,
        gamma             = 0.05,
        tree_method       = "hist",
        random_state      = 42,
        n_jobs            = -1,
        early_stopping_rounds = None,
    )
    if xgb_params:
        default_xgb.update(xgb_params)

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model",        XGBRegressor(**default_xgb)),
    ])

    print(f"✅ Pipeline construit")
    print(f"   Numériques  ({len(num_cols)}) : {num_cols}")
    print(f"   Binaires    ({len(bin_cols)}) : {bin_cols}")
    print(f"   Catégoriels ({len(cat_cols)}) : {cat_cols}")
    return pipeline


# ══════════════════════════════════════════════════════════════════════════
# 4. ENTRAÎNEMENT
# ══════════════════════════════════════════════════════════════════════════

def train(pipeline, X_train, y_train, X_val=None, y_val=None):
    if X_val is not None and y_val is not None:
        preprocessor = pipeline.named_steps["preprocessor"]
        model        = pipeline.named_steps["model"]
        X_train_prep = preprocessor.fit_transform(X_train)
        X_val_prep   = preprocessor.transform(X_val)
        model.set_params(early_stopping_rounds=50)
        model.fit(
            X_train_prep, y_train,
            eval_set=[(X_val_prep, y_val)],
            verbose=100,
        )
        print(f"✅ Entraînement terminé — meilleure itération : {model.best_iteration}")
    else:
        pipeline.fit(X_train, y_train)
        print("✅ Entraînement terminé")
    return pipeline


# ══════════════════════════════════════════════════════════════════════════
# 5. ÉVALUATION
# ══════════════════════════════════════════════════════════════════════════

def evaluate(pipeline, X_test, y_test, cv_folds: int = 5):
    log_pred   = pipeline.predict(X_test)
    y_pred_mad = np.exp(log_pred)
    y_true_mad = np.exp(y_test.values)

    mae  = mean_absolute_error(y_true_mad, y_pred_mad)
    rmse = np.sqrt(mean_squared_error(y_true_mad, y_pred_mad))
    r2   = r2_score(y_true_mad, y_pred_mad)
    mape = np.mean(np.abs((y_true_mad - y_pred_mad) / y_true_mad)) * 100

    kf    = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_r2 = cross_val_score(pipeline, X_test, y_test, cv=kf, scoring="r2")

    metrics = {
        "MAE (MAD)"    : mae,
        "RMSE (MAD)"   : rmse,
        "R²"           : r2,
        "MAPE (%)"     : mape,
        "CV R² (mean)" : cv_r2.mean(),
        "CV R² (std)"  : cv_r2.std(),
    }

    print("\n" + "═" * 45)
    print("  MÉTRIQUES D'ÉVALUATION — TERRAIN")
    print("═" * 45)
    print(f"  MAE              : {mae:>15,.0f} MAD")
    print(f"  RMSE             : {rmse:>15,.0f} MAD")
    print(f"  R²               : {r2:>15.4f}")
    print(f"  MAPE             : {mape:>14.2f} %")
    print(f"  CV R² ({cv_folds} folds)  : {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
    print("═" * 45)

    return metrics


# ══════════════════════════════════════════════════════════════════════════
# 6. VISUALISATIONS
# ══════════════════════════════════════════════════════════════════════════

def plot_results(pipeline, X_test, y_test):
    log_pred   = pipeline.predict(X_test)
    y_pred_mad = np.exp(log_pred)
    y_true_mad = np.exp(y_test.values)
    residuals  = y_true_mad - y_pred_mad

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Évaluation XGBoost — Prix Terrains Marrakech",
                 fontsize=14, fontweight="bold", y=1.01)

    # 1. Prédictions vs Réel
    ax = axes[0, 0]
    ax.scatter(y_true_mad / 1e6, y_pred_mad / 1e6, alpha=0.4, s=18, color="#2563EB")
    lims = [min(y_true_mad.min(), y_pred_mad.min()) / 1e6,
            max(y_true_mad.max(), y_pred_mad.max()) / 1e6]
    ax.plot(lims, lims, "r--", linewidth=1.5, label="Parfait")
    ax.set_xlabel("Prix réel (millions MAD)")
    ax.set_ylabel("Prix prédit (millions MAD)")
    ax.set_title("Prédictions vs Valeurs réelles")
    ax.legend(); ax.grid(True, alpha=0.3)

    # 2. Distribution des résidus
    ax = axes[0, 1]
    ax.hist(residuals / 1e3, bins=60, color="#10B981", edgecolor="white", linewidth=0.5)
    ax.axvline(0, color="red", linestyle="--", linewidth=1.5)
    ax.set_xlabel("Résidu (milliers MAD)")
    ax.set_ylabel("Fréquence")
    ax.set_title("Distribution des résidus")
    ax.grid(True, alpha=0.3)

    # 3. Résidus vs Prédictions
    ax = axes[1, 0]
    ax.scatter(y_pred_mad / 1e6, residuals / 1e3, alpha=0.4, s=18, color="#F59E0B")
    ax.axhline(0, color="red", linestyle="--", linewidth=1.5)
    ax.set_xlabel("Prix prédit (millions MAD)")
    ax.set_ylabel("Résidu (milliers MAD)")
    ax.set_title("Résidus vs Prédictions")
    ax.grid(True, alpha=0.3)

    # 4. Feature Importance
    ax = axes[1, 1]
    preprocessor = pipeline.named_steps["preprocessor"]
    model        = pipeline.named_steps["model"]
    try:
        num_names = list(preprocessor.transformers_[0][2])
        bin_names = list(preprocessor.transformers_[1][2])
        cat_enc   = preprocessor.transformers_[2][1]
        cat_names = list(cat_enc.get_feature_names_out(CATEGORICAL_FEATURES))
        feature_names = num_names + bin_names + cat_names
    except Exception:
        feature_names = [f"f{i}" for i in range(model.n_features_in_)]

    importances = model.feature_importances_
    top_n = min(15, len(feature_names))
    idx   = np.argsort(importances)[-top_n:]
    ax.barh([feature_names[i] for i in idx], importances[idx], color="#6366F1")
    ax.set_xlabel("Importance")
    ax.set_title(f"Top {top_n} Feature Importances")
    ax.grid(True, alpha=0.3, axis="x")

    plt.tight_layout()
    plt.savefig("terrain_model_evaluation.png", dpi=150, bbox_inches="tight")
    plt.show()
    print("✅ Graphiques sauvegardés → terrain_model_evaluation.png")


# ══════════════════════════════════════════════════════════════════════════
# 7. PRÉDICTION SUR UN NOUVEAU TERRAIN
# ══════════════════════════════════════════════════════════════════════════

def predict_price(pipeline, terrain: dict) -> float:
    """
    Prédit le prix d'un terrain depuis un dict de features.

    Les features terrain-specific (log_surface, palier_surface, etc.) sont
    calculées automatiquement si absentes du dict.

    Exemple :
        t = {
            "surface_num"          : 2000,
            "quartier_clean"       : "Palmeraie",
            "prix_m2_moy_quartier" : 4500,
            "prix_median_quartier" : 8_500_000,
            "piscine"    : 0,  "parking" : 0, "jardin"      : 1,
            "securite"   : 0,  "vue"     : 0, "terrasse"    : 0,
            "neuf"       : 0,  "meuble"  : 0, "climatisation": 0,
            "hammam"     : 0,  "cave"    : 0, "ascenseur"   : 0,
        }
        prix = predict_price(pipeline, t)
    """
    t = terrain.copy()

    # Calcul automatique des features dérivées si absentes
    if "log_surface" not in t:
        t["log_surface"] = np.log1p(t["surface_num"])

    if "log_surface_sq" not in t:
        t["log_surface_sq"] = t["log_surface"] ** 2

    if "surface_log_x_pm2" not in t:
        t["surface_log_x_pm2"] = (
            t["log_surface"] * t.get("prix_m2_moy_quartier", 0) / 1e3
        )

    if "prix_m2_std_quartier" not in t:
        t["prix_m2_std_quartier"] = 0.0  # neutre si quartier inconnu

    if "prix_estime" not in t:
        t["prix_estime"] = t["surface_num"] * t.get("prix_m2_moy_quartier", 0)

    if "log_prix_estime" not in t:
        t["log_prix_estime"] = np.log1p(t.get("prix_estime", 0))

    if "nb_listings_quartier" not in t:
        t["nb_listings_quartier"] = 10  # valeur neutre si quartier inconnu

    if "residuel_surface" not in t:
        t["residuel_surface"] = 0.0  # neutre si info quartier indisponible

    if "is_particulier" not in t:
        t["is_particulier"] = 0  # professionnel par défaut

    if "source_clean" not in t:
        t["source_clean"] = "avito"  # source la plus fréquente

    if "ratio_pm2_city" not in t:
        t["ratio_pm2_city"] = 1.0  # neutre = prix moyen de la ville

    if "km_x_log_surface" not in t:
        t["km_x_log_surface"] = 0.0  # neutre si km inconnu

    if "palier_surface" not in t:
        s = t["surface_num"]
        bins = [0, 200, 500, 1000, 5000, 20000, np.inf]
        t["palier_surface"] = sum(1 for b in bins[1:] if s > b) - 1
        t["palier_surface"] = max(0, min(5, t["palier_surface"]))

    if "surface_relative" not in t:
        t["surface_relative"] = 1.0   # neutre si quartier inconnu

    if "surface_x_quartier" not in t:
        t["surface_x_quartier"] = (
            t["surface_num"] * t.get("prix_median_quartier", 1_500_000) / 1e6
        )

    # Champs hérités appartement (forcés à 0 pour terrain)
    for col in ["etage", "etage_known", "chambres_num", "salles_bain_num"]:
        t.setdefault(col, 0)

    t.setdefault("surface_par_chambre", t["surface_num"])

    # Scores calculés à partir des équipements
    eq_terrain  = ["piscine", "jardin", "securite", "vue", "parking"]
    eq_standing = ["piscine", "terrasse", "vue", "hammam", "climatisation", "securite"]
    eq_total    = ["piscine","parking","ascenseur","terrasse","jardin",
                   "climatisation","securite","vue","cave","hammam"]

    t.setdefault("score_terrain",  sum(t.get(e, 0) for e in eq_terrain))
    t.setdefault("score_standing", sum(t.get(e, 0) for e in eq_standing))
    t.setdefault("nb_equipements", sum(t.get(e, 0) for e in eq_total))

    df_input = pd.DataFrame([t])
    log_pred = pipeline.predict(df_input)[0]
    prix_mad = np.exp(log_pred)

    print(f"🏗️  Terrain  : {t.get('surface_num')} m²  |  Quartier : {t.get('quartier_clean', 'N/A')}")
    print(f"💰 Prix estimé : {prix_mad:,.0f} MAD  ({prix_mad / 10.8:,.0f} EUR approx.)")
    print(f"   Prix/m²    : {prix_mad / t['surface_num']:,.0f} MAD/m²")

    return prix_mad
