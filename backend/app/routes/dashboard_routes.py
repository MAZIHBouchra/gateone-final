from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import Property, Lead, Blog

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    # On compte les vraies données en base
    listings = db.query(Property).count()
    leads = db.query(Lead).filter(Lead.ai_score >= 70).count()
    # Somme des articles de blog + articles de propriétés
    blogs = db.query(Blog).count()
    
    return {
        "online_listings": listings,
        "qualified_leads": leads,
        "ai_content_count": blogs + listings,
        "market_index": "6.8%"
    }