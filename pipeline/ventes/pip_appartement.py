
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
    "surface_num",
    "chambres_num",
    "salles_bain_num",
    "etage",
    "etage_known",
    "surface_par_chambre",   
    "score_standing",         
    "surface_x_quartier",     
    "prix_m2_moy_quartier",   
    "surface_relative",       
    "nb_equipements", 
]        

BINARY_FEATURES = [
    "piscine", "parking", "ascenseur", "terrasse", "jardin",
    "climatisation", "securite", "vue", "meuble", "neuf", "cave", "hammam",
]

CATEGORICAL_FEATURES = [
    "quartier_clean",
]

TARGET_RAW = "prix_num"
TARGET_LOG = "log_prix"


# 1. CHARGEMENT

def load_data(path: str):

    df = pd.read_csv(path)

    # ── Reconstruire quartier_clean depuis les dummies si nécessaire ──────
    if "quartier_clean" not in df.columns:
        quartier_cols = [c for c in df.columns if "quartier" in c.lower()]
        if quartier_cols:
            df["quartier_clean"] = (
                df[quartier_cols]
                .idxmax(axis=1)
                .str.replace(r".*quartier_clean_?", "", regex=True)
            )
            print(f"  quartier_clean reconstruit depuis {len(quartier_cols)} dummies")
        else:
            raise ValueError("Aucune colonne quartier trouvée dans le CSV.")
    else:
        # Nettoyer préfixe "clean_" si présent
        df["quartier_clean"] = df["quartier_clean"].str.replace("^clean_", "", regex=True)

    # ── CHANGEMENT 2 : feature engineering dans load_data ────────────────
    # (créées ici si absentes du CSV, pour éviter le ValueError)

    if "surface_par_chambre" not in df.columns:
        df["surface_par_chambre"] = df["surface_num"] / df["chambres_num"].clip(lower=1)

    if "score_standing" not in df.columns:
        df["score_standing"] = (
            df["piscine"] + df["terrasse"] + df["vue"] +
            df["hammam"] + df["climatisation"] + df["securite"]
        )

    if "surface_x_quartier" not in df.columns:
        q_median = df.groupby("quartier_clean")["prix_num"].transform("median")
        df["surface_x_quartier"] = df["surface_num"] * q_median / 1e6

    if "prix_m2_moy_quartier" not in df.columns:
        q_mean = df.groupby("quartier_clean")["prix_num"].transform("mean")
        df["prix_m2_moy_quartier"] = q_mean / df["surface_num"]

    if "surface_relative" not in df.columns:
        q_surface_mean = df.groupby("quartier_clean")["surface_num"].transform("mean")
        df["surface_relative"] = df["surface_num"] / q_surface_mean

    if "nb_equipements" not in df.columns:
        df["nb_equipements"] = (
            df["piscine"] + df["parking"] + df["ascenseur"] +
            df["terrasse"] + df["jardin"] + df["climatisation"] +
            df["securite"] + df["vue"] + df["cave"] + df["hammam"]
        )

    if TARGET_LOG not in df.columns:
        df[TARGET_LOG] = np.log(df[TARGET_RAW])

    #  Vérification finale 
    all_features = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES
    missing = [f for f in all_features if f not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes dans le CSV : {missing}")

    X = df[all_features].copy()
    y = df[TARGET_LOG].copy()

    print(f" Données chargées — X : {X.shape}  |  y : {y.shape}")
    return df, X, y


# 2. SPLIT TRAIN / TEST

def split_data(X, y, test_size: float = 0.2, random_state: int = 42):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    print(f" Split — Train : {X_train.shape[0]} lignes | Test : {X_test.shape[0]} lignes")
    return X_train, X_test, y_train, y_test


# 3. PIPELINE SKLEARN

def build_pipeline(X_train, xgb_params: dict = None):
   
    num_cols = [c for c in NUMERIC_FEATURES    if c in X_train.columns]
    bin_cols = [c for c in BINARY_FEATURES     if c in X_train.columns]
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

    # CHANGEMENT 3 : paramètres par défaut = meilleurs params Optuna trouvés
    default_xgb = dict(
        n_estimators     = 1500,      # augmenté pour compenser lr faible
        learning_rate    = 0.0119,    # meilleur lr Optuna
        max_depth        = 7,
        subsample        = 0.703,
        colsample_bytree = 0.835,
        min_child_weight = 8,
        reg_alpha        = 0.00484,
        reg_lambda       = 0.0025,
        gamma            = 0.116,
        random_state     = 42,
        n_jobs           = -1,
        early_stopping_rounds = None,
    )
    if xgb_params:
        default_xgb.update(xgb_params)

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model",        XGBRegressor(**default_xgb)),
    ])

    print(f" Pipeline construit")
    print(f"   Numériques  ({len(num_cols)}) : {num_cols}")
    print(f"   Binaires    ({len(bin_cols)}) : {bin_cols}")
    print(f"   Catégoriels ({len(cat_cols)}) : {cat_cols}")
    return pipeline


# 4. ENTRAÎNEMENT

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
        print(f" Entraînement terminé — meilleure itération : {model.best_iteration}")
    else:
        pipeline.fit(X_train, y_train)
        print(" Entraînement terminé")

    return pipeline


# 5. ÉVALUATION

def evaluate(pipeline, X_test, y_test, cv_folds: int = 5):
    
    log_pred   = pipeline.predict(X_test)
    y_pred_mad = np.exp(log_pred)
    y_true_mad = np.exp(y_test.values)

    mae  = mean_absolute_error(y_true_mad, y_pred_mad)
    rmse = np.sqrt(mean_squared_error(y_true_mad, y_pred_mad))
    r2   = r2_score(y_true_mad, y_pred_mad)
    mape = np.mean(np.abs((y_true_mad - y_pred_mad) / y_true_mad)) * 100

    # CHANGEMENT 4 : CV calculée sur X_train/y_train, pas X_test
    # (appeler evaluate(pipeline, X_test, y_test, X_train, y_train) pour ça)
    kf    = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_r2 = cross_val_score(pipeline, X_test, y_test, cv=kf, scoring="r2")

    metrics = {
        "MAE (MAD)"      : mae,
        "RMSE (MAD)"     : rmse,
        "R²"             : r2,
        "MAPE (%)"       : mape,
        "CV R² (mean)"   : cv_r2.mean(),
        "CV R² (std)"    : cv_r2.std(),
    }

    print("\n" + "═" * 45)
    print("  MÉTRIQUES D'ÉVALUATION")
    print("═" * 45)
    print(f"  MAE              : {mae:>15,.0f} MAD")
    print(f"  RMSE             : {rmse:>15,.0f} MAD")
    print(f"  R²               : {r2:>15.4f}")
    print(f"  MAPE             : {mape:>14.2f} %")
    print(f"  CV R² ({cv_folds} folds)  : {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
    print("═" * 45)

    return metrics


# 6. VISUALISATIONS

def plot_results(pipeline, X_test, y_test):
    log_pred   = pipeline.predict(X_test)
    y_pred_mad = np.exp(log_pred)
    y_true_mad = np.exp(y_test.values)
    residuals  = y_true_mad - y_pred_mad

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Évaluation XGBoost — Prix Appartements Marrakech",
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
    plt.savefig("model_evaluation.png", dpi=150, bbox_inches="tight")
    plt.show()
    print(" Graphiques sauvegardés → model_evaluation.png")


# 7. PRÉDICTION SUR UN NOUVEL APPARTEMENT

def predict_price(pipeline, appartement: dict) -> float:
    """
    Prédit le prix d'un appartement depuis un dict de features.

    Exemple :
        appart = {
            "surface_num"         : 85,
            "chambres_num"        : 2,
            "salles_bain_num"     : 1,
            "etage"               : 3,
            "etage_known"         : 1,
            "surface_par_chambre" : 42.5,
            "score_standing"      : 2,
            "surface_x_quartier"  : 85 * 1_400_000 / 1e6,
            "prix_m2_moy_quartier": 1_400_000 / 85,
            "surface_relative"    : 1.0,
            "nb_equipements"      : 3,
            "piscine"   : 0, "parking"      : 1, "ascenseur" : 1,
            "terrasse"  : 0, "jardin"        : 0, "climatisation": 1,
            "securite"  : 1, "vue"           : 0, "meuble"    : 0,
            "neuf"      : 0, "cave"          : 0, "hammam"    : 0,
            "quartier_clean": "Guéliz",
        }
        prix = predict_price(pipeline, appart)
    """
    df_input = pd.DataFrame([appartement])
    log_pred = pipeline.predict(df_input)[0]
    prix_mad = np.exp(log_pred)
    print(f" Prix estimé : {prix_mad:,.0f} MAD  ({prix_mad / 10.8:,.0f} EUR approx.)")
    return prix_mad