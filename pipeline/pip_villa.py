from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import optuna
optuna.logging.set_verbosity(optuna.logging.WARNING)

# ── Features (avec textuelles) ───────────────────────────────────────────
NUMERIC_FEATURES_BASE = [
    "surface_num","chambres_num","salles_bain_num","etage","etage_known",
    "surface_par_chambre","score_standing","score_exterieur",
    "nb_equipements","standing_premium","ratio_ch_surface",
    # Nouvelles features textuelles
    "surface_terrain_text",   # corrélation 0.487 !!
    "text_standing_score",    # corrélation 0.185
    "kw_standing",            # corrélation 0.214
    "kw_architecte",          # corrélation 0.145
    "kw_jardin",              # corrélation 0.136
    "kw_renove",              # corrélation 0.114
]
BINARY_FEATURES = [
    "piscine","parking","ascenseur","terrasse","jardin","climatisation",
    "securite","vue","meuble","neuf","cave","hammam",
    "kw_projet",              # signal négatif (-0.024)
]
CATEGORICAL_FEATURES = ["quartier_clean","localisation_fine","cat_surface"]
TARGET_LOG = "log_prix"

BASE_FEATURES = NUMERIC_FEATURES_BASE + BINARY_FEATURES + CATEGORICAL_FEATURES
X = df[BASE_FEATURES].copy()
y = df[TARGET_LOG].copy()

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Train : {X_train.shape[0]} | Test : {X_test.shape[0]}")

# ── Features groupby sans leakage ────────────────────────────────────────
def add_groupby_features(X_tr, X_te):
    tmp = X_tr.copy()
    tmp["prix_num"] = np.exp(y_train)

    q_prix_med  = tmp.groupby("quartier_clean")["prix_num"].median()
    q_prix_mean = tmp.groupby("quartier_clean")["prix_num"].mean()
    q_surf_mean = tmp.groupby("quartier_clean")["surface_num"].mean()
    l_prix_med  = tmp.groupby("localisation_fine")["prix_num"].median()
    l_surf_mean = tmp.groupby("localisation_fine")["surface_num"].mean()

    fallback_p = tmp["prix_num"].median()
    fallback_s = tmp["surface_num"].mean()

    for X in [X_tr, X_te]:
        X["surface_x_quartier"]   = X["surface_num"] * X["quartier_clean"].map(q_prix_med).fillna(fallback_p) / 1e6
        X["prix_m2_moy_quartier"] = X["quartier_clean"].map(q_prix_mean).fillna(fallback_p) / X["surface_num"]
        X["surface_relative"]     = X["surface_num"] / X["quartier_clean"].map(q_surf_mean).fillna(fallback_s)
        X["loc_prix_m2_median"]   = X["localisation_fine"].map(l_prix_med).fillna(fallback_p) / X["surface_num"]
        X["surface_x_loc"]        = X["surface_num"] * X["localisation_fine"].map(l_prix_med).fillna(fallback_p) / 1e6
        X["surface_rel_loc"]      = X["surface_num"] / X["localisation_fine"].map(l_surf_mean).fillna(fallback_s)
        # Interaction terrain × localisation (nouvelle)
        X["terrain_x_loc"]        = X["surface_terrain_text"] * X["localisation_fine"].map(l_prix_med).fillna(fallback_p) / 1e6
    return X_tr, X_te

X_train_enc, X_test_enc = add_groupby_features(X_train.copy(), X_test.copy())

GROUPBY_FEATURES = [
    "surface_x_quartier","prix_m2_moy_quartier","surface_relative",
    "loc_prix_m2_median","surface_x_loc","surface_rel_loc",
    "terrain_x_loc",      # nouvelle interaction
]
NUMERIC_FEATURES = NUMERIC_FEATURES_BASE + GROUPBY_FEATURES
ALL_FEATURES     = NUMERIC_FEATURES + BINARY_FEATURES + CATEGORICAL_FEATURES

# ── Preprocessor ─────────────────────────────────────────────────────────
preprocessor = ColumnTransformer([
    ("num", StandardScaler(),                                              NUMERIC_FEATURES),
    ("bin", "passthrough",                                                 BINARY_FEATURES),
    ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False),   CATEGORICAL_FEATURES),
], remainder="drop")
preprocessor.fit(X_train_enc[ALL_FEATURES])

# ── Optuna ───────────────────────────────────────────────────────────────
def objective(trial):
    params = dict(
        n_estimators     = trial.suggest_int("n_estimators", 500, 3000),
        learning_rate    = trial.suggest_float("learning_rate", 0.005, 0.08, log=True),
        max_depth        = trial.suggest_int("max_depth", 3, 8),
        subsample        = trial.suggest_float("subsample", 0.6, 1.0),
        colsample_bytree = trial.suggest_float("colsample_bytree", 0.5, 1.0),
        min_child_weight = trial.suggest_int("min_child_weight", 3, 15),
        reg_alpha        = trial.suggest_float("reg_alpha", 1e-4, 10.0, log=True),
        reg_lambda       = trial.suggest_float("reg_lambda", 1e-4, 10.0, log=True),
        gamma            = trial.suggest_float("gamma", 0, 5),
    )
    pipe = Pipeline([
        ("pre",   preprocessor),
        ("model", XGBRegressor(**params, random_state=42, n_jobs=-1)),
    ])
    return cross_val_score(
        pipe, X_train_enc[ALL_FEATURES], y_train, cv=5, scoring="r2", n_jobs=-1
    ).mean()

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=150, show_progress_bar=True)
print(f"\n✅ Meilleur R² CV : {study.best_value:.4f}")

# ── Entraînement final ───────────────────────────────────────────────────
pipeline_final = Pipeline([
    ("pre",   preprocessor),
    ("model", XGBRegressor(**study.best_params, random_state=42, n_jobs=-1)),
])
pipeline_final.fit(X_train_enc[ALL_FEATURES], y_train)

# ── Évaluation ───────────────────────────────────────────────────────────
y_pred_mad = np.exp(pipeline_final.predict(X_test_enc[ALL_FEATURES]))
y_true_mad = np.exp(y_test.values)

r2   = r2_score(y_true_mad, y_pred_mad)
mae  = mean_absolute_error(y_true_mad, y_pred_mad)
mape = np.mean(np.abs((y_true_mad - y_pred_mad) / y_true_mad)) * 100
kf   = KFold(5, shuffle=True, random_state=42)
cv_r2 = cross_val_score(pipeline_final, X_train_enc[ALL_FEATURES], y_train, cv=kf, scoring="r2")

print(f"\n{'═'*45}")
print(f"  R²   : {r2:.4f}")
print(f"  MAE  : {mae:,.0f} MAD")
print(f"  MAPE : {mape:.2f} %")
print(f"  CV R²: {cv_r2.mean():.4f} ± {cv_r2.std():.4f}")
print(f"{'═'*45}")