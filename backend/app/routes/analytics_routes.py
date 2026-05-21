from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.market_service import MarketService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])
market_service = MarketService()

@router.post("/update-neighborhood-stats")
async def update_stats(
    neighborhood: str = Query(..., description="Le quartier à analyser (ex: Palmeraie)"), 
    db: Session = Depends(get_db)
):
    """
    DÉCLENCHEUR ANALYTIQUE : Calcule et enregistre les stats réelles du quartier.
    """
    try:
        result = market_service.update_neighborhood_stats(db, neighborhood)
        if not result:
            raise HTTPException(
                status_code=404, 
                detail=f"Aucune donnée trouvée pour le quartier : {neighborhood}"
            )
        
        return {
            "status": "success",
            "message": f"Statistiques mises à jour pour {neighborhood}",
            "data": {
                "avg_price_sqm": result.avg_price_sqm,
                "total_properties": result.supply_count,
                "last_update": result.trend_date
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market-trends")
async def get_trends(db: Session = Depends(get_db)):
    """
    Récupère les 10 dernières analyses de marché pour le Dashboard.
    """
    return market_service.get_market_trends(db)