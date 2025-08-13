# backend/xgb_real_estate.py
from __future__ import annotations

import os
from pathlib import Path
from datetime import datetime
import warnings

warnings.filterwarnings("ignore")

import joblib
import pickle  # seulement pour compat .pkl si besoin
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split, KFold, GridSearchCV, cross_val_score
from sklearn.preprocessing import RobustScaler, PowerTransformer
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

import xgboost as xgb


# =========================
#  Utilitaires de chemin
# =========================
_BACKEND_DIR = Path(__file__).resolve().parent
_DEFAULT_MODEL_PATH = (_BACKEND_DIR / "models" / "xgboost_real_estate_model.joblib").as_posix()


def _normalize_to_joblib_path(path_or_stem: str | None) -> str:
    """
    Retourne un chemin absolu vers un fichier .joblib.
    - Si None: lit MODEL_PATH (env) sinon _DEFAULT_MODEL_PATH
    - Accepte un chemin avec ou sans extension
    - Si relatif: résolu par rapport à backend/
    """
    if not path_or_stem:
        path_or_stem = os.getenv("MODEL_PATH", _DEFAULT_MODEL_PATH)

    p = Path(path_or_stem)

    # Si aucun suffixe, on ajoute .joblib
    if p.suffix == "":
        p = p.with_suffix(".joblib")

    # S'il est relatif, on le résout par rapport à backend/
    if not p.is_absolute():
        p = _BACKEND_DIR / p

    return p.as_posix()


class XGBoostRealEstatePredictor:
    """
    Classe 'lib' utilisée par l'API FastAPI.
    - Prétraitement/entraînement disponibles (non exécutés par défaut)
    - Sauvegarde/chargement en .joblib
    """

    def __init__(self):
        self.model = None
        self.scaler = RobustScaler()
        self.target_transformer = PowerTransformer(method='yeo-johnson')
        self.feature_selector = SelectKBest(f_regression, k='all')
        self.feature_columns: list[str] | None = None

        self.location_stats: Dict[str, Any] = {}
        self.category_stats: Dict[str, Any] = {}
        self.price_percentiles: Dict[str, float] = {}
        self.model_metadata: Dict[str, Any] = {}

        self.original_locations: list[str] = []
        self.original_categories: list[str] = []

    # =========================
    #   Prétraitement & FE
    # =========================
    def advanced_preprocessing(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        print("Advanced preprocessing starting...")
        data = df.copy()

        # Colonnes à ignorer si présentes
        columns_to_drop = [
            'Unnamed: 0', 'URL', 'Title', 'Description',
            'Scraping Date', 'scraped_at', 'merged_description_features'
        ]
        data = data.drop(columns=[c for c in columns_to_drop if c in data.columns], errors='ignore')

        # Casting numérique hors colonnes catégorielles clés
        print("Converting data types...")
        protect_cols = {'Price', 'Location', 'Category & Type'}
        for col in data.columns:
            if col not in protect_cols:
                data[col] = pd.to_numeric(data[col], errors='coerce')

        # Retirer lignes inexploitables
        required = [c for c in ['Price', 'Location', 'Category & Type', 'Surface Area'] if c in data.columns]
        data = data.dropna(subset=required)
        print(f"Data shape after removing missing values: {data.shape}")

        # Outliers (IQR 5–95%)
        for col in [c for c in ['Price', 'Surface Area', 'Total Rooms', 'Bathrooms'] if c in data.columns]:
            Q1 = data[col].quantile(0.05)
            Q3 = data[col].quantile(0.95)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            before = len(data)
            data = data[(data[col] >= lower) & (data[col] <= upper)]
            print(f"Removed {before - len(data)} outliers from {col}")

        # Stats localisation
        location_stats = data.groupby('Location').agg({
            'Price': ['mean', 'median', 'std', 'count'],
            'Surface Area': 'mean',
            'Total Rooms': 'mean'
        }).round(2)
        location_stats.columns = ['_'.join(col).strip() for col in location_stats.columns]
        location_stats = location_stats.reset_index()

        self.location_stats = {}
        for _, row in location_stats.iterrows():
            loc = row['Location']
            self.location_stats[loc] = {
                'price_mean': row.get('Price_mean', 0.0),
                'price_median': row.get('Price_median', 0.0),
                'price_std': 0.0 if pd.isna(row.get('Price_std', np.nan)) else row.get('Price_std', 0.0),
                'location_popularity': row.get('Price_count', 0),
                'avg_surface': row.get('Surface Area_mean', 0.0),
                'avg_rooms': row.get('Total Rooms_mean', 0.0),
            }

        # Encodage localisation
        data['Location_Price_Mean'] = data['Location'].map(lambda x: self.location_stats.get(x, {}).get('price_mean', 0))
        data['Location_Price_Median'] = data['Location'].map(lambda x: self.location_stats.get(x, {}).get('price_median', 0))
        data['Location_Popularity'] = data['Location'].map(lambda x: self.location_stats.get(x, {}).get('location_popularity', 0))
        data['Location_Avg_Surface'] = data['Location'].map(lambda x: self.location_stats.get(x, {}).get('avg_surface', 0))

        # Stats catégorie
        category_col = 'Category & Type'
        category_stats = data.groupby(category_col).agg({
            'Price': ['mean', 'median', 'count'],
            'Surface Area': 'mean'
        }).round(2)
        category_stats.columns = ['_'.join(col).strip() for col in category_stats.columns]
        category_stats = category_stats.reset_index()

        self.category_stats = {}
        for _, row in category_stats.iterrows():
            cat = row[category_col]
            self.category_stats[cat] = {
                'price_mean': row.get('Price_mean', 0.0),
                'price_median': row.get('Price_median', 0.0),
                'category_count': row.get('Price_count', 0),
                'avg_surface': row.get('Surface Area_mean', 0.0),
            }

        data['Category_Price_Mean'] = data[category_col].map(lambda x: self.category_stats.get(x, {}).get('price_mean', 0))
        data['Category_Price_Median'] = data[category_col].map(lambda x: self.category_stats.get(x, {}).get('price_median', 0))
        data['Category_Count'] = data[category_col].map(lambda x: self.category_stats.get(x, {}).get('category_count', 0))

        # Engineering
        eps = 1e-9
        data['Price_per_sqm'] = data['Price'] / (data['Surface Area'] + eps)
        if 'Total Rooms' in data.columns:
            data['Price_per_room'] = data['Price'] / (data['Total Rooms'] + eps)
            data['Surface_per_room'] = data['Surface Area'] / (data['Total Rooms'] + eps)
            data['Bathroom_ratio'] = data.get('Bathrooms', 0) / (data['Total Rooms'] + eps)
        else:
            data['Price_per_room'] = 0.0
            data['Surface_per_room'] = 0.0
            data['Bathroom_ratio'] = 0.0

        luxury_features = [
            'has_pool', 'has_garden', 'has_parking', 'has_air_conditioning',
            'has_elevator', 'furnished', 'has_security', 'has_fireplace',
            'has_kitchen_equipped', 'has_heating', 'duplex', 'high_standing',
            'new_construction', 'has_double_glazing'
        ]
        available_luxury = [c for c in luxury_features if c in data.columns]
        for c in available_luxury:
            data[c] = pd.to_numeric(data[c], errors='coerce').fillna(0)

        data['Luxury_Score'] = data[available_luxury].sum(axis=1) if available_luxury else 0
        data['Luxury_Ratio'] = data['Luxury_Score'] / max(len(available_luxury), 1)

        data['Size_Category_Numeric'] = pd.cut(
            data['Surface Area'],
            bins=[0, 50, 100, 150, 200, 300, float('inf')],
            labels=[1, 2, 3, 4, 5, 6]
        )
        data['Size_Category_Numeric'] = pd.to_numeric(data['Size_Category_Numeric'], errors='coerce').fillna(3)

        if 'Total Rooms' in data.columns:
            data['Room_Density'] = data['Total Rooms'] / (data['Surface Area'] + eps)
        else:
            data['Room_Density'] = 0.0

        data['Location_Category_Interaction'] = (
            data['Location_Price_Mean'] * data['Category_Price_Mean'] / 1_000_000.0
        )
        data['Size_Luxury_Interaction'] = data['Surface Area'] * data['Luxury_Score']

        # Features finales
        feature_cols = [
            'Location_Price_Mean', 'Location_Price_Median', 'Location_Popularity', 'Location_Avg_Surface',
            'Category_Price_Mean', 'Category_Price_Median', 'Category_Count',
            'Surface Area', 'Total Rooms', 'Bathrooms', 'Price_per_sqm', 'Surface_per_room',
            'Bathroom_ratio', 'Luxury_Score', 'Luxury_Ratio', 'Size_Category_Numeric',
            'Room_Density', 'Location_Category_Interaction', 'Size_Luxury_Interaction'
        ] + available_luxury

        self.feature_columns = [c for c in feature_cols if c in data.columns]
        X = data[self.feature_columns].copy().apply(pd.to_numeric, errors='coerce').fillna(0)
        y = pd.to_numeric(data['Price'], errors='coerce')
        mask = y.notna()
        X, y = X.loc[mask], y.loc[mask]
        X = X.replace([np.inf, -np.inf], 0).fillna(0)

        # percentiles de prix
        self.price_percentiles = {
            'p10': y.quantile(0.10),
            'p25': y.quantile(0.25),
            'p50': y.quantile(0.50),
            'p75': y.quantile(0.75),
            'p90': y.quantile(0.90),
        }

        self.original_locations = data['Location'].dropna().unique().tolist()
        self.original_categories = data[category_col].dropna().unique().tolist()

        print(f"Final dataset shape: {X.shape}")
        print(f"Features used: {len(self.feature_columns)}")
        print(f"Price range: {y.min():,.0f} - {y.max():,.0f} MAD")
        return X, y

    # =========================
    #   Entraînement
    # =========================
    def train_xgboost_model(self, X: pd.DataFrame, y: pd.Series):
        print("Training XGBoost model with hyperparameter tuning...")

        try:
            y_bins = pd.qcut(y, q=5, duplicates='drop')
        except Exception:
            y_bins = None

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y_bins
        )

        y_train_t = self.target_transformer.fit_transform(y_train.values.reshape(-1, 1)).ravel()
        y_test_t = self.target_transformer.transform(y_test.values.reshape(-1, 1)).ravel()

        X_train_sel = self.feature_selector.fit_transform(X_train, y_train)
        X_test_sel = self.feature_selector.transform(X_test)

        X_train_sc = self.scaler.fit_transform(X_train_sel)
        X_test_sc = self.scaler.transform(X_test_sel)

        xgb_params = {
            'n_estimators': [300],
            'max_depth': [6],
            'learning_rate': [0.05],
            'subsample': [0.8],
            'colsample_bytree': [0.9],
            'reg_alpha': [0.1],
            'reg_lambda': [1.0],
        }
        xgb_model = xgb.XGBRegressor(random_state=42, n_jobs=-1, verbosity=0)
        kf = KFold(n_splits=5, shuffle=True, random_state=42)

        print("Performing hyperparameter tuning...")
        grid = GridSearchCV(
            estimator=xgb_model,
            param_grid=xgb_params,
            cv=kf,
            scoring='r2',
            n_jobs=-1,
            verbose=1
        )
        grid.fit(X_train_sc, y_train_t)

        self.model = grid.best_estimator_
        best_params = grid.best_params_

        y_pred_t = self.model.predict(X_test_sc)
        y_pred = self.target_transformer.inverse_transform(y_pred_t.reshape(-1, 1)).ravel()

        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        rmse = float(np.sqrt(mse))

        cv_scores = cross_val_score(self.model, X_train_sc, y_train_t, cv=kf, scoring='r2')
        cv_mean = float(cv_scores.mean())
        cv_std = float(cv_scores.std())

        self.model_metadata = {
            'best_params': best_params,
            'r2_score': float(r2),
            'cv_r2_mean': cv_mean,
            'cv_r2_std': cv_std,
            'mae': float(mae),
            'rmse': rmse,
            'training_samples': int(len(X_train)),
            'test_samples': int(len(X_test)),
            'n_features': int(X_train_sc.shape[1]),
            'training_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        }

        print("\n" + "=" * 60)
        print("XGBOOST MODEL TRAINING RESULTS")
        print("=" * 60)
        print(f"Best Parameters: {best_params}")
        print(f"R² Score: {r2:.4f}")
        print(f"Cross-Validation R²: {cv_mean:.4f} (±{cv_std:.4f})")
        print(f"MAE: {mae:,.0f} MAD")
        print(f"RMSE: {rmse:,.0f} MAD")
        print(f"Training Samples: {len(X_train)}")
        print(f"Test Samples: {len(X_test)}")
        print(f"Features Used: {X_train_sc.shape[1]}")
        return X_test_sc, y_test, y_pred

    # =========================
    #   Visualisation
    # =========================
    def plot_model_results(self, X_test_sc, y_test, y_pred):
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))

        if hasattr(self.model, 'feature_importances_'):
            fi = self.model.feature_importances_
            selected_mask = self.feature_selector.get_support()
            selected_names = [f for f, keep in zip(self.feature_columns, selected_mask) if keep]
            top_idx = np.argsort(fi)[-15:]
            top_features = [selected_names[i] for i in top_idx]
            top_importance = fi[top_idx]

            axes[0, 0].barh(range(len(top_features)), top_importance)
            axes[0, 0].set_yticks(range(len(top_features)))
            axes[0, 0].set_yticklabels(top_features)
            axes[0, 0].set_xlabel('Importance')
            axes[0, 0].set_title('Top 15 XGBoost Feature Importance')
            axes[0, 0].grid(True, alpha=0.3)

        metrics = ['R² Score', 'CV R²', 'MAE (K MAD)', 'RMSE (K MAD)']
        values = [
            self.model_metadata['r2_score'],
            self.model_metadata['cv_r2_mean'],
            self.model_metadata['mae'] / 1000,
            self.model_metadata['rmse'] / 1000
        ]
        bars = axes[0, 1].bar(metrics, values)
        axes[0, 1].set_title('XGBoost Model Performance Metrics')
        axes[0, 1].set_ylabel('Score / Error')
        axes[0, 1].grid(True, alpha=0.3)
        for b, v in zip(bars, values):
            axes[0, 1].text(b.get_x() + b.get_width()/2., b.get_height(), f'{v:.3f}', ha='center', va='bottom')

        axes[1, 0].scatter(y_test, y_pred, alpha=0.6)
        lo = min(y_test.min(), y_pred.min())
        hi = max(y_test.max(), y_pred.max())
        axes[1, 0].plot([lo, hi], [lo, hi], 'r--', lw=2)
        axes[1, 0].set_xlabel('Actual Price (MAD)')
        axes[1, 0].set_ylabel('Predicted Price (MAD)')
        axes[1, 0].set_title('Predicted vs Actual Prices')
        axes[1, 0].grid(True, alpha=0.3)
        axes[1, 0].text(0.05, 0.95, f'R² = {self.model_metadata["r2_score"]:.4f}',
                        transform=axes[1, 0].transAxes, fontsize=12,
                        bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8))

        residuals = y_test - y_pred
        axes[1, 1].scatter(y_pred, residuals, alpha=0.6)
        axes[1, 1].axhline(y=0, linestyle='--')
        axes[1, 1].set_xlabel('Predicted Price (MAD)')
        axes[1, 1].set_ylabel('Residuals (MAD)')
        axes[1, 1].set_title('Residual Plot')
        axes[1, 1].grid(True, alpha=0.3)

        plt.tight_layout()
        plt.show()

    # =========================
    #   Prédiction
    # =========================
    def predict_price_with_range(self, location, category_type, surface_area, total_rooms, bathrooms, **amenities):
        if self.model is None:
            raise ValueError("Model not trained yet!")

        input_features = self._create_input_features(
            location, category_type, surface_area, total_rooms, bathrooms, **amenities
        )
        input_selected = self.feature_selector.transform([input_features])
        input_scaled = self.scaler.transform(input_selected)

        pred_t = self.model.predict(input_scaled)[0]
        prediction = self.target_transformer.inverse_transform([[pred_t]])[0][0]

        uncertainty = 0.12
        lower = max(0, prediction * (1 - uncertainty))
        upper = prediction * (1 + uncertainty)
        price_range = f"{lower:,.0f} - {upper:,.0f} MAD"
        return float(prediction), price_range, float(lower), float(upper)

    def _create_input_features(self, location, category_type, surface_area, total_rooms, bathrooms, **amenities):
        input_data = np.zeros(len(self.feature_columns), dtype=float)

        # Localisation (fallback médian si inconnue)
        loc_stats = self.location_stats.get(location, {})
        if not loc_stats:
            means = [v.get('price_mean', 0) for v in self.location_stats.values() if v.get('price_mean', 0) > 0]
            median_mean = np.median(means) if len(means) else 0
            loc_stats = {
                'price_mean': median_mean,
                'price_median': median_mean,
                'location_popularity': 10,
                'avg_surface': 100,
            }

        # Catégorie (fallback médian si inconnue)
        cat_stats = self.category_stats.get(category_type, {})
        if not cat_stats:
            means = [v.get('price_mean', 0) for v in self.category_stats.values() if v.get('price_mean', 0) > 0]
            median_mean = np.median(means) if len(means) else 0
            cat_stats = {
                'price_mean': median_mean,
                'price_median': median_mean,
                'category_count': 100,
            }

        eps = 1e-9
        surface_per_room = surface_area / (total_rooms + eps)
        bathroom_ratio = bathrooms / (total_rooms + eps)

        luxury_features = [
            'pool', 'terrace', 'balcony', 'garden', 'parking', 'air_conditioning',
            'elevator', 'furnished', 'security', 'fireplace', 'kitchen_equipped',
            'heating', 'hammam', 'concierge', 'duplex', 'high_standing',
            'new_construction', 'double_glazing'
        ]
        luxury_score = sum(int(bool(amenities.get(f, 0))) for f in luxury_features)
        luxury_ratio = luxury_score / max(len(luxury_features), 1)

        size_bins = [(0, 50, 1), (50, 100, 2), (100, 150, 3), (150, 200, 4), (200, 300, 5)]
        size_category = 6
        for lo, hi, lab in size_bins:
            if lo <= surface_area < hi:
                size_category = lab
                break

        room_density = total_rooms / (surface_area + eps)
        loc_cat_inter = loc_stats.get('price_mean', 0) * cat_stats.get('price_mean', 0) / 1_000_000.0
        size_lux_inter = surface_area * luxury_score

        feature_map = {
            'Location_Price_Mean': loc_stats.get('price_mean', 0),
            'Location_Price_Median': loc_stats.get('price_median', 0),
            'Location_Popularity': loc_stats.get('location_popularity', 0),
            'Location_Avg_Surface': loc_stats.get('avg_surface', 0),
            'Category_Price_Mean': cat_stats.get('price_mean', 0),
            'Category_Price_Median': cat_stats.get('price_median', 0),
            'Category_Count': cat_stats.get('category_count', 0),
            'Surface Area': surface_area,
            'Total Rooms': total_rooms,
            'Bathrooms': bathrooms,
            'Price_per_sqm': 0.0,
            'Surface_per_room': surface_per_room,
            'Bathroom_ratio': bathroom_ratio,
            'Luxury_Score': luxury_score,
            'Luxury_Ratio': luxury_ratio,
            'Size_Category_Numeric': size_category,
            'Room_Density': room_density,
            'Location_Category_Interaction': loc_cat_inter,
            'Size_Luxury_Interaction': size_lux_inter,
        }

        amenity_mapping = {
            'has_pool': 'pool', 'has_terrace': 'terrace', 'has_balcony': 'balcony',
            'has_garden': 'garden', 'has_parking': 'parking', 'has_air_conditioning': 'air_conditioning',
            'has_elevator': 'elevator', 'furnished': 'furnished', 'has_security': 'security',
            'has_fireplace': 'fireplace', 'has_kitchen_equipped': 'kitchen_equipped',
            'has_heating': 'heating', 'has_hammam': 'hammam', 'has_concierge': 'concierge',
            'duplex': 'duplex', 'high_standing': 'high_standing',
            'new_construction': 'new_construction', 'has_double_glazing': 'double_glazing'
        }
        for feature_name, amenity_key in amenity_mapping.items():
            feature_map[feature_name] = int(bool(amenities.get(amenity_key, 0)))

        for i, feat in enumerate(self.feature_columns):
            input_data[i] = feature_map.get(feat, 0.0)

        return input_data

    # =========================
    #   Catégorisation / résumé
    # =========================
    def get_price_category(self, price: float) -> str:
        if price <= self.price_percentiles['p25']:
            return "Budget Range"
        elif price <= self.price_percentiles['p50']:
            return "Lower-Mid Range"
        elif price <= self.price_percentiles['p75']:
            return "Mid Range"
        elif price <= self.price_percentiles['p90']:
            return "Upper-Mid Range"
        else:
            return "Luxury Range"

    def model_summary(self):
        if self.model is None:
            print("No model trained yet!")
            return

        print("\n" + "=" * 70)
        print("XGBOOST MODEL SUMMARY")
        print("=" * 70)
        print(f"Training Date: {self.model_metadata.get('training_date')}")
        print(f"R² Score: {self.model_metadata.get('r2_score'):.4f}")
        print(f"CV R²: {self.model_metadata.get('cv_r2_mean'):.4f} (±{self.model_metadata.get('cv_r2_std'):.4f})")
        print(f"MAE: {self.model_metadata.get('mae'):,.0f} MAD")
        print(f"RMSE: {self.model_metadata.get('rmse'):,.0f} MAD")
        print(f"Training Samples: {self.model_metadata.get('training_samples')}")
        print(f"Test Samples: {self.model_metadata.get('test_samples')}")
        print(f"Features Used: {self.model_metadata.get('n_features')}")
        print("\nBest Hyperparameters:")
        for p, v in (self.model_metadata.get('best_params') or {}).items():
            print(f"  {p}: {v}")
        print("\nPrice Distribution:")
        print(f"  ≤25%: ≤{self.price_percentiles['p25']:,.0f} MAD")
        print(f"  25–50%: {self.price_percentiles['p25']:,.0f}–{self.price_percentiles['p50']:,.0f} MAD")
        print(f"  50–75%: {self.price_percentiles['p50']:,.0f}–{self.price_percentiles['p75']:,.0f} MAD")
        print(f"  75–90%: {self.price_percentiles['p75']:,.0f}–{self.price_percentiles['p90']:,.0f} MAD")
        print(f"  >90%: >{self.price_percentiles['p90']:,.0f} MAD")

    # =========================
    #   Sauvegarde / Chargement
    # =========================
    def save_model(self, filename_or_path: str | None = None) -> str:
        """
        Sauvegarde en .joblib.
        - filename_or_path: chemin complet OU "stem" (sans extension). Si None -> MODEL_PATH ou défaut.
        Retourne le chemin absolu utilisé.
        """
        if self.model is None:
            raise ValueError("No trained model to save!")

        path = _normalize_to_joblib_path(filename_or_path)
        bundle = {
            'model': self.model,
            'scaler': self.scaler,
            'target_transformer': self.target_transformer,
            'feature_selector': self.feature_selector,
            'feature_columns': self.feature_columns,
            'location_stats': self.location_stats,
            'category_stats': self.category_stats,
            'price_percentiles': self.price_percentiles,
            'model_metadata': self.model_metadata,
            'original_locations': self.original_locations,
            'original_categories': self.original_categories,
        }

        Path(path).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(bundle, path, compress=3)

        print("\n" + "=" * 60)
        print("MODEL SAVED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Main model file: {path}")
        print("Model metadata:")
        for k, v in self.model_metadata.items():
            print(f"  {k}: {v}")
        return path

    @staticmethod
    def load_model(filename_or_path: str | None = None) -> "XGBoostRealEstatePredictor":
        """
        Charge un modèle .joblib.
        - filename_or_path: chemin complet OU "stem" (avec ou sans extension). Si None -> MODEL_PATH ou défaut.
        """
        path = _normalize_to_joblib_path(filename_or_path)
        try:
            bundle = joblib.load(path)
        except Exception as e:
            # compat éventuelle si quelqu'un a sauvegardé en .pkl
            alt_pkl = Path(path).with_suffix(".pkl")
            if alt_pkl.exists():
                with open(alt_pkl, "rb") as f:
                    bundle = pickle.load(f)
            else:
                raise ValueError(f"Could not load model from {path}") from e

        predictor = XGBoostRealEstatePredictor()
        predictor.model = bundle['model']
        predictor.scaler = bundle['scaler']
        predictor.target_transformer = bundle['target_transformer']
        predictor.feature_selector = bundle['feature_selector']
        predictor.feature_columns = bundle['feature_columns']
        predictor.location_stats = bundle['location_stats']
        predictor.category_stats = bundle['category_stats']
        predictor.price_percentiles = bundle['price_percentiles']
        predictor.model_metadata = bundle['model_metadata']
        predictor.original_locations = bundle['original_locations']
        predictor.original_categories = bundle['original_categories']

        print(f"Model loaded successfully from {path}")
        td = predictor.model_metadata.get('training_date')
        r2 = predictor.model_metadata.get('r2_score')
        if td is not None:
            print(f"Model trained on: {td}")
        if r2 is not None:
            print(f"Model R² score: {r2:.4f}")
        return predictor
def get_available_locations(self):
    return list(self.location_stats.keys())

def get_available_categories(self):
    return list(self.category_stats.keys())

# =========================
#  Outils optionnels (CLI)
# =========================
def train_and_save_model(csv_path: str = 'final_data.csv'):
    """Pipeline complet d'entraînement (optionnel, pour usage CLI)."""
    print("=" * 70)
    print("XGBOOST REAL ESTATE PRICE PREDICTION MODEL")
    print("=" * 70)

    try:
        print(f"Loading dataset from '{csv_path}'...")
        df = pd.read_csv(csv_path)
        print(f"Dataset loaded successfully! Shape: {df.shape}")

        predictor = XGBoostRealEstatePredictor()

        print("\nAdvanced preprocessing...")
        X, y = predictor.advanced_preprocessing(df)

        print("\nPrice statistics:")
        print(f"Mean: {y.mean():,.0f} MAD")
        print(f"Median: {y.median():,.0f} MAD")
        print(f"Std: {y.std():,.0f} MAD")

        print("\nTraining XGBoost model (this may take several minutes)...")
        X_test_sc, y_test, y_pred = predictor.train_xgboost_model(X, y)

        print("\nGenerating visualizations...")
        predictor.plot_model_results(X_test_sc, y_test, y_pred)

        # Sauvegarde au chemin par défaut (ou MODEL_PATH)
        model_path = predictor.save_model(None)
        predictor.model_summary()

        print("\n" + "=" * 70)
        print("MODEL READY FOR USE!")
        print("=" * 70)
        print("Your trained XGBoost model has been saved and is ready for predictions.")
        print(f"Path: {model_path}")
        return predictor, model_path
    

    except FileNotFoundError:
        print(f"ERROR: '{csv_path}' file not found!")
        return None, None
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        return None, None


if __name__ == "__main__":
    # Lancement CLI facultatif (n’est jamais appelé dans l’API)
    train_and_save_model(csv_path='final_data.csv')
