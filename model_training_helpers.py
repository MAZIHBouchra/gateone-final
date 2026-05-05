from sklearn.model_selection import train_test_split, RandomizedSearchCV, GridSearchCV
from sklearn.preprocessing import RobustScaler, OneHotEncoder, TargetEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import IsolationForest
import joblib
import numpy as np
import os

def preprocess_data(df, property_type='appartement'):
    """
    Réalise le feature engineering et la suppression des outliers.
    """
    df_eng = df.copy()
    
    # 1. Nettoyage de l'étage (conversion en numérique)
    if 'etage' in df_eng.columns:
        def clean_etage(x):
            x = str(x).lower()
            if 'rjc' in x or 'rez' in x: return 0
            if '1' in x: return 1
            if '2' in x: return 2
            if '3' in x: return 3
            if '4' in x: return 4
            if '5' in x: return 5
            if '6' in x: return 6
            if '7' in x: return 7
            if '8' in x: return 8
            return np.nan
        
        df_eng['etage_num'] = df_eng['etage'].apply(clean_etage)
        # Remplissage des nans par le mode ou une valeur par défaut
        df_eng['etage_num'] = df_eng['etage_num'].fillna(df_eng['etage_num'].median() if not df_eng['etage_num'].isna().all() else 0)

    # 2. Feature Engineering
    if 'surface_num' in df_eng.columns and 'chambres_num' in df_eng.columns:
        df_eng['surface_par_chambre'] = df_eng['surface_num'] / (df_eng['chambres_num'].replace(0, 1))
        
    commodities = ['piscine', 'parking', 'ascenseur', 'terrasse', 'jardin', 'climatisation', 'securite', 'vue', 'meuble', 'neuf', 'cave', 'hammam']
    existing_commodities = [c for c in commodities if c in df_eng.columns]
    if existing_commodities:
        df_eng['score_commodites'] = df_eng[existing_commodities].sum(axis=1)
        if 'surface_num' in df_eng.columns:
            df_eng['surface_score_interaction'] = df_eng['surface_num'] * df_eng['score_commodites']
            
    if 'quartier' in df_eng.columns:
        luxe_quartiers = ['Agdal', 'Hivernage', 'Palmeraie', 'Guéliz', 'Targa']
        df_eng['is_luxury_location'] = df_eng['quartier'].apply(lambda x: 1 if str(x) in luxe_quartiers else 0)
        
    if 'prix_m2_median_quartier' in df_eng.columns and 'surface_num' in df_eng.columns:
        df_eng['prix_estime_quartier'] = df_eng['prix_m2_median_quartier'] * df_eng['surface_num']
    
    # 3. Text features from description (if available)
    if 'description' in df_eng.columns:
        keywords = ['luxe', 'standing', 'neuf', 'rénové', 'moderne', 'calme', 'vue atlas', 'piscine', 'sécurisée', 'ascenseur', 'parking', 'ensoleillé']
        for kw in keywords:
            col_name = f'kw_{kw.replace(" ", "_")}'
            df_eng[col_name] = df_eng['description'].fillna('').str.lower().str.contains(kw).astype(int)
    
    # 4. Outlier removal intelligent et plus strict
    if 'prix_num' in df_eng.columns:
        if property_type == 'appartement':
            # On resserre la fourchette de prix pour éliminer le bruit extrême
            df_eng = df_eng[(df_eng['prix_num'] >= 250000) & (df_eng['prix_num'] <= 3000000)]
            
            if 'surface_num' in df_eng.columns:
                df_eng['temp_prix_m2'] = df_eng['prix_num'] / df_eng['surface_num']
                # Filtrage plus strict sur le prix au m2 (le coeur du marché)
                df_eng = df_eng[(df_eng['temp_prix_m2'] >= 5000) & (df_eng['temp_prix_m2'] <= 22000)]
                df_eng = df_eng.drop(columns=['temp_prix_m2'])
                
                # Filtrage des surfaces
                df_eng = df_eng[(df_eng['surface_num'] >= 35) & (df_eng['surface_num'] <= 250)]
            
            # Suppression des anomalies via Isolation Forest (optionnel mais puissant)
            # On ne le fait que si on a assez de colonnes numériques
            iso_features = ['prix_num', 'surface_num', 'chambres_num', 'salles_bain_num']
            iso_features = [f for f in iso_features if f in df_eng.columns]
            if len(df_eng) > 100:
                iso = IsolationForest(contamination=0.03, random_state=42)
                preds = iso.fit_predict(df_eng[iso_features])
                df_eng = df_eng[preds == 1]
            
    return df_eng

# split du data

def split_data(data, target, test_size=0.2, random_state=42):
    """
    Sépare les données en features (X) et cible (y), et divise en train/test.
    Exclut automatiquement les colonnes inutiles ou causant du data leakage.
    """
    # Colonnes à exclure pour éviter le "data leakage" ou car elles sont inutiles
    leaks_and_useless = ['prix_num', 'prix_m2', 'log_prix_num', 'type_bien', 'id', 'url', 'source', 'titre', 'description', 'localisation']
    cols_to_drop = [col for col in leaks_and_useless if col in data.columns and col != target]
    
    x = data.drop(columns=cols_to_drop + [target])
    y = data[target]

    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=test_size, random_state=random_state)

    return x_train, x_test, y_train, y_test

def get_features(X):
    """
    Identifie automatiquement les colonnes numériques et catégorielles.
    """
    num_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    cat_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    return num_features, cat_features

# realisation du pipeline sklearn

def model_pipeline(num_columns, cat_columns, model):
    """
    Crée un pipeline de prétraitement et de modélisation.
    Utilise TargetEncoder pour les variables catégorielles (plus efficace pour le prix).
    """
    numeric_transform = Pipeline(steps=[("scaler", RobustScaler())])
    categoric_transform = Pipeline(steps=[("encode", TargetEncoder())])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transform, num_columns),
            ("cat", categoric_transform, cat_columns)
        ]
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("feature_selection", SelectKBest(score_func=f_regression, k='all')),
            ("model", model)
        ]
    )

# Metriques d'evaluation

def metric_model(y_true, y_pred, model_name="Modèle"):
    """
    Calcule les principales métriques d'évaluation pour une régression.
    """
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    
    return {
        'MAE': mae,
        'RMSE': rmse,
        'R2': r2
    }

def print_metrics(metrics, model_name="Modèle"):
    """
    Affiche les métriques de manière lisible.
    """
    print(f"\n--- Évaluation des performances : {model_name} ---")
    print(f"MAE (Erreur Absolue Moyenne) : {metrics['MAE']:,.2f} DH")
    print(f"RMSE (Racine de l'Erreur Quadratique Moyenne) : {metrics['RMSE']:,.2f} DH")
    print(f"Score R² : {metrics['R2']:.4f}")

def save_model(pipeline, filename, directory='models'):
    """
    Sauvegarde le pipeline d'entraînement dans un fichier joblib.
    """
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    filepath = os.path.join(directory, filename)
    joblib.dump(pipeline, filepath)
    print(f"Modèle sauvegardé dans : {filepath}")

def tune_model(X_train, y_train, num_features, cat_features, model_class, param_dist, n_iter=20, cv=5):
    """
    Effectue une recherche aléatoire d'hyperparamètres pour optimiser le modèle.
    """
    # On crée un pipeline de base avec le modèle non initialisé
    base_pipeline = model_pipeline(num_features, cat_features, model_class())
    
    # On adapte les clés du param_dist pour correspondre au pipeline (préfixe 'model__')
    pipeline_param_dist = {f'model__{k}': v for k, v in param_dist.items()}
    
    search = RandomizedSearchCV(
        base_pipeline, 
        param_distributions=pipeline_param_dist, 
        n_iter=n_iter, 
        cv=cv, 
        scoring='neg_mean_absolute_error',
        verbose=1,
        random_state=42,
        n_jobs=-1
    )
    
    print(f"Lancement de l'optimisation des hyperparamètres ({n_iter} itérations)...")
    search.fit(X_train, y_train)
    
    print(f"Meilleurs paramètres trouvés : {search.best_params_}")
    print(f"Meilleur score (MAE) : {-search.best_score_:,.2f}")
    
    return search.best_estimator_

def grid_search_model(X_train, y_train, num_features, cat_features, model_class, param_grid, cv=5):
    """
    Effectue une recherche par grille (GridSearchCV) d'hyperparamètres pour optimiser le modèle.
    """
    # On crée un pipeline de base avec le modèle non initialisé
    base_pipeline = model_pipeline(num_features, cat_features, model_class())
    
    # On adapte les clés du param_grid pour correspondre au pipeline (préfixe 'model__')
    pipeline_param_grid = {f'model__{k}': v for k, v in param_grid.items()}
    
    search = GridSearchCV(
        base_pipeline, 
        param_grid=pipeline_param_grid, 
        cv=cv, 
        scoring='neg_mean_absolute_error',
        verbose=1,
        n_jobs=-1
    )
    
    print(f"Lancement de la recherche sur grille GridSearchCV...")
    search.fit(X_train, y_train)
    
    print(f"Meilleurs paramètres trouvés : {search.best_params_}")
    print(f"Meilleur score (MAE) : {-search.best_score_:,.2f}")
    
    return search.best_estimator_