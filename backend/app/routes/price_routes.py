# backend/price_routes.py
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, conint, confloat
from typing import Annotated, Dict, Optional, Any

from app.services.price_model import PredictorService
price_router = APIRouter(prefix="/price", tags=["price"])


class PredictRequest(BaseModel):
       location: str = Field(..., description="Quartier/Ville tel que dans le dataset")
       category_type: str = Field(..., description="Type de bien (ex: Apartment)")
       surface_area: Annotated[float, Field(gt=0, description="Surface en m²")]   # > 0
       total_rooms: Annotated[int, Field(ge=0, description="Nombre de pièces")]   # ≥ 0
       bathrooms: Annotated[int, Field(ge=0, description="Nombre de SDB")]        # ≥ 0
       amenities: Optional[Dict[str, int]] = Field(default_factory=dict, description="Ex: {'parking':1,'pool':0}")


@price_router.get("/health")
def health() -> Dict[str, Any]:
    svc = PredictorService.instance()
    return {"ready": svc.is_ready(), "model_path": svc.model_path}


@price_router.get("/lists")
def lists() -> Dict[str, Any]:
    svc = PredictorService.instance()
    # si pas chargé, on tente un chargement
    if not svc.is_ready():
        if not svc.load():
            # 503 plutôt que 500, plus clair pour le front
            raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        data = svc.lists()
        # convertir en listes Python simples (au cas où)
        locations = list(map(str, data.get("locations", [])))
        categories = list(map(str, data.get("categories", [])))
        return {"locations": locations, "categories": categories}
    except Exception as e:
        # renvoie le type d'erreur pour debug immédiat
        raise HTTPException(status_code=500, detail=f"lists failed: {type(e).__name__}: {e}")


@price_router.get("/meta")
def meta() -> Dict[str, Any]:
    svc = PredictorService.instance()
    if not svc.is_ready() and not svc.load():
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        m = svc.meta()
        # cast pour éviter les erreurs JSON (numpy types)
        def _f(x): 
            return float(x) if isinstance(x, (int, float)) else x
        pp = m.get("price_percentiles", {})
        m["price_percentiles"] = {k: float(v) for k, v in pp.items()}
        if "r2" in m and m["r2"] is not None: m["r2"] = float(m["r2"])
        if "cv_r2_mean" in m and m["cv_r2_mean"] is not None: m["cv_r2_mean"] = float(m["cv_r2_mean"])
        if "cv_r2_std" in m and m["cv_r2_std"] is not None: m["cv_r2_std"] = float(m["cv_r2_std"])
        if "mae" in m and m["mae"] is not None: m["mae"] = float(m["mae"])
        if "rmse" in m and m["rmse"] is not None: m["rmse"] = float(m["rmse"])
        if "n_features" in m and m["n_features"] is not None: m["n_features"] = int(m["n_features"])
        return m
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"meta failed: {type(e).__name__}: {e}")


@price_router.post("/predict")
def predict(req: PredictRequest) -> Dict[str, Any]:
    svc = PredictorService.instance()
    if not svc.is_ready() and not svc.load():
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        out = svc.predict_one(
            location=req.location,
            category_type=req.category_type,
            surface_area=float(req.surface_area),
            total_rooms=int(req.total_rooms),
            bathrooms=int(req.bathrooms),
            amenities=req.amenities or {},
        )
        # cast simple pour JSON
        out["prediction"] = float(out["prediction"])
        out["lower"] = float(out["lower"])
        out["upper"] = float(out["upper"])
        out["price_per_sqm"] = float(out["price_per_sqm"])
        return out
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"predict failed: {type(e).__name__}: {e}")


@price_router.get("/aggregates")
def aggregates() -> Dict[str, Any]:
    """Stats par location pour cartes/graphes."""
    svc = PredictorService.instance()
    if not svc.is_ready() and not svc.load():
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        loc = svc.predictor.location_stats  # dict: name -> {price_mean, price_median, location_popularity, ...}
        rows = []
        for name, v in loc.items():
            rows.append({
                "location": str(name),
                "price_mean": float(v.get("price_mean", 0.0) or 0.0),
                "price_median": float(v.get("price_median", 0.0) or 0.0),
                "count": int(v.get("location_popularity", 0) or 0),
            })
        return {"locations": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"aggregates failed: {type(e).__name__}: {e}")
