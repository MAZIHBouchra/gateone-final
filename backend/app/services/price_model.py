# backend/price_model.py
from __future__ import annotations
from pathlib import Path
import os
from typing import Dict, Any

from xgb_real_estate import XGBoostRealEstatePredictor


class PredictorService:
    _instance: "PredictorService | None" = None

    def __init__(self, model_path: str):
        self.model_path = model_path  # chemin absolu vers .joblib
        self.predictor: XGBoostRealEstatePredictor | None = None

    @classmethod
    def instance(cls) -> "PredictorService":
        if cls._instance is None:
            backend_dir = Path(__file__).resolve().parent
            # 1) lit l'env si présent, sinon valeur par défaut relative au dossier backend/
            env_path = os.getenv("MODEL_PATH", "models/xgboost_real_estate_model.joblib")
            p = Path(env_path)
            # 2) si relatif → on le résout à partir de backend/
            if not p.is_absolute():
                p = backend_dir / p
            cls._instance = cls(model_path=p.as_posix())
        return cls._instance

    def load(self) -> bool:
        """Charge le modèle une seule fois (singleton)."""
        if self.predictor is not None:
            return True
        try:
            # Passe le chemin ABSOLU tel quel à ta classe
            self.predictor = XGBoostRealEstatePredictor.load_model(self.model_path)
            return True
        except Exception as e:
            print(f"[PredictorService] Load failed: {e}")
            self.predictor = None
            return False

    def is_ready(self) -> bool:
        return self.predictor is not None

    def lists(self) -> Dict[str, Any]:
        if not self.predictor:
            raise RuntimeError("Predictor not loaded")
    # on lit directement les clés des dictionnaires appris
        return {
            "locations": list(self.predictor.location_stats.keys()),
            "categories": list(self.predictor.category_stats.keys()),
    }

    def meta(self) -> Dict[str, Any]:
        """Métadonnées du modèle pour la page dashboard."""
        if not self.predictor:
            raise RuntimeError("Predictor not loaded")
        return {
            "trained_at": self.predictor.model_metadata.get("training_date"),
            "r2": self.predictor.model_metadata.get("r2_score"),
            "cv_r2_mean": self.predictor.model_metadata.get("cv_r2_mean"),
            "cv_r2_std": self.predictor.model_metadata.get("cv_r2_std"),
            "mae": self.predictor.model_metadata.get("mae"),
            "rmse": self.predictor.model_metadata.get("rmse"),
            "n_features": self.predictor.model_metadata.get("n_features"),
            "price_percentiles": self.predictor.price_percentiles,
            "feature_columns": self.predictor.feature_columns,
        }

    def predict_one(
        self,
        *,
        location: str,
        category_type: str,
        surface_area: float,
        total_rooms: int,
        bathrooms: int,
        amenities: Dict[str, int] | None = None,
    ) -> Dict[str, Any]:
        """Appelle la prédiction unique et formate la réponse pour l'API."""
        if not self.predictor:
            raise RuntimeError("Predictor not loaded")
        amenities = amenities or {}

        pred, prange, lower, upper = self.predictor.predict_price_with_range(
            location=location,
            category_type=category_type,
            surface_area=surface_area,
            total_rooms=total_rooms,
            bathrooms=bathrooms,
            **amenities,
        )
        price_category = self.predictor.get_price_category(pred)
        price_per_sqm = float(pred) / max(surface_area, 1e-9)

        return {
            "prediction": float(pred),
            "range": prange,
            "lower": float(lower),
            "upper": float(upper),
            "price_category": price_category,
            "price_per_sqm": price_per_sqm,
        }
