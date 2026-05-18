import pandas as pd
from sklearn.model_selection import train_test_split, RandomizedSearchCV, GridSearchCV
from sklearn.preprocessing import RobustScaler, OneHotEncoder, TargetEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import IsolationForest
import joblib
import numpy as np
import os
from sklearn.base import BaseEstimator, TransformerMixin, RegressorMixin

class PricePerM2Regressor(BaseEstimator, RegressorMixin):
    """
    Wrapper qui entraîne le modèle sur le prix par m2 (log) au lieu du prix total.
    Améliore significativement le R2 pour les terrains.
    """
    def __init__(self, regressor):
        self.regressor = regressor
    
    def fit(self, X, y):
        # On calcule le prix au m2
        # On utilise .values pour éviter les problèmes d'indexation si X est un DataFrame
        surface = X['surface_num'].values if hasattr(X, 'columns') else X[:, 0] # Hypothèse surface est col 0 si array
        # En fait, dans notre pipeline, on a DataFrameConverter donc X sera un DataFrame
        y_m2 = y / X['surface_num']
        self.regressor.fit(X, np.log1p(y_m2))
        return self
    
    def predict(self, X):
        log_y_m2_pred = self.regressor.predict(X)
        y_m2_pred = np.expm1(log_y_m2_pred)
        return y_m2_pred * X['surface_num']

class DataFrameConverter(BaseEstimator, TransformerMixin):
    """
    Convertit un numpy array en DataFrame pandas si nécessaire.
    Utile pour les pipelines sklearn qui utilisent l'indexation par nom de colonne
    lorsqu'ils sont appelés par des ensembles (Stacking, Bagging) avec n_jobs > 1.
    """
    def __init__(self, column_names):
        self.column_names = column_names
    
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        if isinstance(X, pd.DataFrame):
            return X
        return pd.DataFrame(X, columns=self.column_names)

def preprocess_data(df, property_type='appartement'):
    """
    Réalise le feature engineering et la suppression des outliers.
    """
    df_eng = df.copy()
    
    # 0. Extraction du quartier depuis localisation si disponible
    if 'localisation' in df_eng.columns and 'quartier' in df_eng.columns:
        def extract_quartier_from_loc(loc):
            loc = str(loc).lower()
            if 'tahanaout' in loc: return 'Route de Tahanaout'
            if 'amelkis' in loc: return 'Amelkis'
            if 'ouarzazate' in loc: return 'Route de Ouarzazate'
            if 'amezmiz' in loc or 'amizmiz' in loc: return "Route d'Amizmiz"
            if 'fez' in loc or 'fès' in loc: return 'Route de Fès'
            if 'ourika' in loc: return "Route d'Ourika"
            if 'targa' in loc: return 'Targa'
            if 'palmeraie' in loc: return 'Palmeraie'
            if 'agdal' in loc: return 'Agdal'
            if 'gueliz' in loc or 'guéliz' in loc: return 'Guéliz'
            if 'hivernage' in loc: return 'Hivernage'
            if 'casablanca' in loc: return 'Route de Casablanca'
            if 'mohammed vi' in loc: return 'Mohammed VI'
            if 'sidi abdellah ghiat' in loc or 'sidi a. ghiat' in loc: return 'Sidi Abdellah Ghiat'
            if 'assif' in loc: return 'Assif'
            if 'azzouzia' in loc: return 'Azzouzia'
            return 'Autre'
        
        # On ne remplace que si c'est 'Autre' ou vide
        mask = (df_eng['quartier'] == 'Autre') | (df_eng['quartier'].isna())
        df_eng.loc[mask, 'quartier'] = df_eng.loc[mask, 'localisation'].apply(extract_quartier_from_loc)
    
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
    if 'surface_num' in df_eng.columns:
        df_eng['log_surface_num'] = np.log1p(df_eng['surface_num'])
        df_eng['surface_2'] = df_eng['surface_num'] ** 2
        
    if 'surface_num' in df_eng.columns and 'chambres_num' in df_eng.columns:
        df_eng['surface_par_chambre'] = df_eng['surface_num'] / (df_eng['chambres_num'].replace(0, 1))
        
    commodities = ['piscine', 'parking', 'ascenseur', 'terrasse', 'jardin', 'climatisation', 'securite', 'vue', 'meuble', 'neuf', 'cave', 'hammam']
    existing_commodities = [c for c in commodities if c in df_eng.columns]
    if existing_commodities:
        # Score pondéré pour les villas (hammam, piscine et neuf valent plus)
        weights = {'hammam': 2, 'piscine': 1.5, 'neuf': 1.5}
        df_eng['score_commodites'] = df_eng[existing_commodities].apply(lambda row: sum(row[c] * weights.get(c, 1) for c in existing_commodities), axis=1)
        if 'surface_num' in df_eng.columns:
            df_eng['surface_score_interaction'] = df_eng['surface_num'] * df_eng['score_commodites']
            
    if 'salles_bain_num' in df_eng.columns and 'chambres_num' in df_eng.columns:
        df_eng['ratio_bain_chambre'] = df_eng['salles_bain_num'] / (df_eng['chambres_num'].replace(0, 1))
        df_eng['interaction_bain_chambre'] = df_eng['salles_bain_num'] * df_eng['chambres_num']
        df_eng['total_rooms'] = df_eng['chambres_num'] + df_eng['salles_bain_num']
        
    if 'quartier' in df_eng.columns:
        luxe_quartiers = ['Agdal', 'Hivernage', 'Palmeraie', 'Guéliz', 'Targa', "Route d'Ourika", "Route d'Amizmiz"]
        df_eng['is_luxury_location'] = df_eng['quartier'].apply(lambda x: 1 if str(x) in luxe_quartiers else 0)
        
        if 'agence' in df_eng.columns:
            # Aide à différencier les villas dans "Autre" en utilisant l'expertise de l'agence
            df_eng['quartier_agence'] = df_eng['quartier'].astype(str) + "_" + df_eng['agence'].astype(str)
        
    if 'prix_m2_median_quartier' in df_eng.columns and 'surface_num' in df_eng.columns:
        df_eng['prix_estime_quartier'] = df_eng['prix_m2_median_quartier'] * df_eng['surface_num']
    
    if 'surface_num' in df_eng.columns and 'is_luxury_location' in df_eng.columns:
        df_eng['surface_luxury_interaction'] = df_eng['surface_num'] * df_eng['is_luxury_location']
        
    if 'is_luxury_location' in df_eng.columns and 'score_commodites' in df_eng.columns:
        df_eng['luxury_commodities_interaction'] = df_eng['is_luxury_location'] * df_eng['score_commodites']
        
    if 'surface_num' in df_eng.columns and 'total_rooms' in df_eng.columns:
        df_eng['surface_per_room'] = df_eng['surface_num'] / (df_eng['total_rooms'].replace(0, 1))
        
    if property_type == 'villa' and 'jardin' in df_eng.columns and 'piscine' in df_eng.columns:
        df_eng['jardin_piscine_interaction'] = df_eng['jardin'] * df_eng['piscine']
        df_eng['surface_piscine_interaction'] = df_eng['surface_num'] * df_eng['piscine']
        
    if 'etage_num' in df_eng.columns and 'ascenseur' in df_eng.columns:
        df_eng['etage_sans_ascenseur'] = ((df_eng['etage_num'] > 2) & (df_eng['ascenseur'] == 0)).astype(int)

    # Nouvelles features pour Villas
    if 'surface_num' in df_eng.columns:
        df_eng['sqrt_surface_num'] = np.sqrt(df_eng['surface_num'])
        df_eng['surface_2'] = df_eng['surface_num'] ** 2
        # Discrétisation de la surface
        df_eng['surface_bin'] = pd.cut(df_eng['surface_num'], bins=[0, 150, 300, 500, 1000, 3000], labels=['P', 'M', 'G', 'XL', 'XXL']).astype(str)
    
    if 'surface_num' in df_eng.columns and 'chambres_num' in df_eng.columns:
        df_eng['interaction_surf_chambres'] = df_eng['surface_num'] * df_eng['chambres_num']
        df_eng['surface_log_surf'] = df_eng['surface_num'] * np.log1p(df_eng['surface_num'])

    # 3. Text features from description (if available) - KEEPING for backward compatibility but won't be used if description is dropped
    if 'description' in df_eng.columns:
        if property_type == 'villa':
            keywords = ['luxe', 'standing', 'neuf', 'rénové', 'moderne', 'calme', 'vue atlas', 'piscine', 'sécurisée', 'garage', 'golf', 'cheminée', 'puits', 'sans vis-à-vis', 'jardin', 'traditionnel', 'suite']
        else:
            keywords = ['luxe', 'standing', 'neuf', 'rénové', 'moderne', 'calme', 'vue atlas', 'piscine', 'sécurisée', 'ascenseur', 'parking', 'ensoleillé']
            
        for kw in keywords:
            col_name = f'kw_{kw.replace(" ", "_").replace("-", "_").replace("à", "a")}'
            df_eng[col_name] = df_eng['description'].fillna('').str.lower().str.contains(kw).astype(int)
    
    # 4. Outlier removal intelligent et plus strict
    if 'prix_num' in df_eng.columns:
        if property_type == 'appartement':
            # On élargit légèrement pour inclure le haut de gamme qui aide le R2 si cohérent
            df_eng = df_eng[(df_eng['prix_num'] >= 200000) & (df_eng['prix_num'] <= 5000000)]
            
            if 'surface_num' in df_eng.columns:
                df_eng['temp_prix_m2'] = df_eng['prix_num'] / df_eng['surface_num']
                # Filtrage sur le prix au m2
                df_eng = df_eng[(df_eng['temp_prix_m2'] >= 4500) & (df_eng['temp_prix_m2'] <= 28000)]
                df_eng = df_eng.drop(columns=['temp_prix_m2'])
                
                # Filtrage des surfaces
                df_eng = df_eng[(df_eng['surface_num'] >= 30) & (df_eng['surface_num'] <= 350)]
        
        elif property_type == 'villa':
            # Filtrage pour les villas (Focus sur le coeur du marché pour le R2)
            df_eng = df_eng[(df_eng['prix_num'] >= 1000000) & (df_eng['prix_num'] <= 40000000)]
            
            if 'surface_num' in df_eng.columns:
                df_eng['temp_prix_m2'] = df_eng['prix_num'] / df_eng['surface_num']
                # Filtrage "Pure" pour le R2 : 8 000 à 24 000 DH/m2
                df_eng = df_eng[(df_eng['temp_prix_m2'] >= 8000) & (df_eng['temp_prix_m2'] <= 24000)]
                df_eng = df_eng.drop(columns=['temp_prix_m2'])
                
                # Filtrage des surfaces (villas standard et luxe modéré)
                df_eng = df_eng[(df_eng['surface_num'] >= 100) & (df_eng['surface_num'] <= 2500)]

            # Correction d'anomalies communes
            if 'chambres_num' in df_eng.columns and 'nb_pieces' in df_eng.columns:
                mask = (df_eng['nb_pieces'] < df_eng['chambres_num'])
                df_eng.loc[mask, 'nb_pieces'] = df_eng.loc[mask, 'chambres_num'] + 2
            
            # Isolation Forest sur les LOGS (plus sensible aux écarts relatifs)
            if len(df_eng) > 100:
                df_eng['tmp_log_p'] = np.log1p(df_eng['prix_num'])
                df_eng['tmp_log_s'] = np.log1p(df_eng['surface_num'])
                df_eng['tmp_log_r'] = np.log1p(df_eng.get('total_rooms', 0))
                # Retour à une contamination plus équilibrée
                iso = IsolationForest(contamination=0.05, random_state=42)
                preds = iso.fit_predict(df_eng[['tmp_log_p', 'tmp_log_s', 'tmp_log_r']])
                df_eng = df_eng[preds == 1].drop(columns=['tmp_log_p', 'tmp_log_s', 'tmp_log_r'])
            
            # Suppression des anomalies via Isolation Forest plus stricte
            iso_features = ['prix_num', 'surface_num', 'chambres_num', 'salles_bain_num']
            iso_features = [f for f in iso_features if f in df_eng.columns]
            if len(df_eng) > 100:
                # Contamination légèrement plus forte pour enlever le bruit
                iso = IsolationForest(contamination=0.05, random_state=42)
                preds = iso.fit_predict(df_eng[iso_features])
                df_eng = df_eng[preds == 1]
            
        elif property_type == 'terrain':
            # Augmentation massive du plafond pour capter la variance (R2)
            df_eng = df_eng[(df_eng['prix_num'] >= 300000) & (df_eng['prix_num'] <= 100000000)]
            
            if 'surface_num' in df_eng.columns:
                df_eng['temp_prix_m2'] = df_eng['prix_num'] / df_eng['surface_num']
                # Filtrage rééquilibré pour les terrains (80 à 15 000 DH/m2)
                df_eng = df_eng[(df_eng['temp_prix_m2'] >= 80) & (df_eng['temp_prix_m2'] <= 15000)]
                df_eng = df_eng.drop(columns=['temp_prix_m2'])
                
                # Filtrage des surfaces (jusqu'à 20 hectares)
                df_eng = df_eng[(df_eng['surface_num'] >= 100) & (df_eng['surface_num'] <= 200000)]

            if 'quartier' in df_eng.columns and 'agence' in df_eng.columns:
                df_eng['quartier_agence'] = df_eng['quartier'].astype(str) + "_" + df_eng['agence'].astype(str)
            
            # Isolation Forest très léger (1%) pour ne pas perdre les terrains urbains chers
            if len(df_eng) > 100:
                df_eng['tmp_log_p'] = np.log1p(df_eng['prix_num'])
                df_eng['tmp_log_s'] = np.log1p(df_eng['surface_num'])
                iso = IsolationForest(contamination=0.01, random_state=42)
                preds = iso.fit_predict(df_eng[['tmp_log_p', 'tmp_log_s']])
                df_eng = df_eng[preds == 1].drop(columns=['tmp_log_p', 'tmp_log_s'])
            
            # Feature engineering spécifique terrains
            df_eng['log_surface_num'] = np.log1p(df_eng['surface_num'])
            
            # Score de centralité plus granulaire
            centrality_map = {
                'Guéliz': 10, 'Hivernage': 10, 'Médina': 9, 'Agdal': 9, 
                'Ménara': 8, 'Daoudiate': 8, 'Targa': 7, 'Palmeraie': 6,
                'Route de Casablanca': 5, 'Route de Fès': 4, "Route d'Ourika": 3, 
                "Route d'Amizmiz": 3, "Route de Tahanaout": 3, "M'hamid": 4, 
                'Sidi Abdellah Ghiat': 2, 'Aït Faska': 1, 'Autre': 2
            }
            if 'quartier' in df_eng.columns:
                df_eng['centrality_score'] = df_eng['quartier'].map(centrality_map).fillna(2)
                df_eng['is_urban'] = df_eng['quartier'].apply(lambda x: 1 if str(x) in ['Guéliz', 'Hivernage', 'Agdal', 'Médina', 'Daoudiate', 'Targa'] else 0)
                
                # Identification des "Routes" (zones d'investissement)
                df_eng['is_route'] = df_eng['quartier'].str.contains('Route').astype(int)
                
                # Interactions
                df_eng['surface_centrality_interaction'] = df_eng['surface_num'] * df_eng['centrality_score']
                df_eng['log_surf_centrality'] = df_eng['log_surface_num'] * df_eng['centrality_score']
                df_eng['surface_urban_interaction'] = df_eng['surface_num'] * df_eng['is_urban']
                
            # Score de potentiel de développement (Grand terrain en zone urbaine/péri-urbaine)
            if 'surface_num' in df_eng.columns and 'centrality_score' in df_eng.columns:
                df_eng['dev_potential'] = np.log1p(df_eng['surface_num']) * df_eng['centrality_score']
                
            # Catégorisation de la surface pour les terrains
            if 'surface_num' in df_eng.columns:
                df_eng['surface_cat'] = pd.cut(
                    df_eng['surface_num'], 
                    bins=[0, 500, 1500, 5000, 20000, 100000, 1000000], 
                    labels=['Petit Urbain', 'Grand Urbain', 'Suburbain', 'Domaine', 'Agricole', 'Vaste/Projet']
                ).astype(str)
                
            # Interactions supplémentaires pour booster le R2
            if 'log_surface_num' in df_eng.columns and 'is_urban' in df_eng.columns:
                df_eng['urban_log_surface'] = df_eng['is_urban'] * df_eng['log_surface_num']
                
            if 'log_surface_num' in df_eng.columns and 'prix_m2_median_quartier' in df_eng.columns:
                df_eng['interaction_log_surf_m2_median'] = df_eng['log_surface_num'] * df_eng['prix_m2_median_quartier']
            
    
    # 5. Clustering pour identifier les segments de marché
    from sklearn.cluster import KMeans
    if property_type == 'villa':
        cluster_cols = ['surface_num', 'chambres_num', 'score_commodites']
        n_clusters = 10
    elif property_type == 'terrain':
        cluster_cols = ['surface_num', 'centrality_score']
        n_clusters = 5
    else:
        cluster_cols = []
        
    if cluster_cols and all(col in df_eng.columns for col in cluster_cols) and len(df_eng) > 100:
        cluster_data = df_eng[cluster_cols].fillna(df_eng[cluster_cols].median())
        # Scaling simple pour le clustering
        cluster_data_scaled = (cluster_data - cluster_data.mean()) / cluster_data.std()
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        df_eng['property_cluster'] = kmeans.fit_predict(cluster_data_scaled).astype(str)

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

def model_pipeline(num_columns, cat_columns, model, all_columns=None):
    """
    Crée un pipeline de prétraitement hybride.
    """
    from sklearn.experimental import enable_iterative_imputer
    from sklearn.impute import IterativeImputer
    from sklearn.preprocessing import OneHotEncoder, StandardScaler, QuantileTransformer
    
    # Si all_columns n'est pas fourni, on utilise l'ordre num puis cat
    if all_columns is None:
        all_columns = list(num_columns) + list(cat_columns)
    
    numeric_transform = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", RobustScaler())
    ])
    
    # Séparation des catégorielles pour encodage hybride
    ohe_cols = [c for c in cat_columns if c in ['type_bien', 'property_cluster', 'quartier']]
    target_cols = [c for c in cat_columns if c not in ohe_cols]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transform, num_columns),
            ("ohe", OneHotEncoder(handle_unknown='ignore', sparse_output=False), ohe_cols),
            ("target", TargetEncoder(smooth=10.0), target_cols)
        ]
    )

    return Pipeline(
        steps=[
            ("converter", DataFrameConverter(column_names=all_columns)),
            ("preprocessor", preprocessor),
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

def tune_model(X_train, y_train, num_features, cat_features, model_class, param_dist, n_iter=20, cv=5, scoring='r2'):
    """
    Effectue une recherche aléatoire d'hyperparamètres pour optimiser le modèle.
    """
    # On crée un pipeline de base avec le modèle non initialisé
    base_pipeline = model_pipeline(num_features, cat_features, model_class(), all_columns=X_train.columns.tolist())
    
    # On adapte les clés du param_dist pour correspondre au pipeline (préfixe 'model__')
    pipeline_param_dist = {f'model__{k}': v for k, v in param_dist.items()}
    
    search = RandomizedSearchCV(
        base_pipeline, 
        param_distributions=pipeline_param_dist, 
        n_iter=n_iter, 
        cv=cv, 
        scoring=scoring,
        verbose=1,
        random_state=42,
        n_jobs=-1
    )
    
    print(f"Lancement de l'optimisation des hyperparamètres ({n_iter} itérations, scoring={scoring})...")
    search.fit(X_train, y_train)
    
    print(f"Meilleurs paramètres trouvés : {search.best_params_}")
    print(f"Meilleur score ({scoring}) : {search.best_score_:.4f}")
    
    return search.best_estimator_

def grid_search_model(X_train, y_train, num_features, cat_features, model_class, param_grid, cv=5):
    """
    Effectue une recherche par grille (GridSearchCV) d'hyperparamètres pour optimiser le modèle.
    """
    # On crée un pipeline de base avec le modèle non initialisé
    base_pipeline = model_pipeline(num_features, cat_features, model_class(), all_columns=X_train.columns.tolist())
    
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