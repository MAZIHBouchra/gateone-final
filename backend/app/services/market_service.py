from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Property, MarketIntelligence
from datetime import datetime

class MarketService:
    def __init__(self):
        pass

    def update_neighborhood_stats(self, db: Session, neighborhood: str):
        """
        Calcule les statistiques réelles d'un quartier et met à jour 
        la table market_intelligence.
        """
        # 1. Calcul du prix moyen au m2 pour ce quartier
        # On divise le prix par la surface pour chaque bien et on fait la moyenne
        stats = db.query(
            func.avg(Property.price / Property.area_sqm).label("avg_price"),
            func.count(Property.id).label("total_listings")
        ).filter(Property.location.ilike(f"%{neighborhood}%")).first()

        if stats and stats.avg_price:
            # 2. On vérifie si une entrée existe déjà pour aujourd'hui
            new_entry = MarketIntelligence(
                neighborhood=neighborhood,
                avg_price_sqm=float(stats.avg_price),
                demand_level=5, # Score par défaut, sera affiné avec les Leads plus tard
                supply_count=stats.total_listings,
                trend_date=datetime.utcnow()
            )
            db.add(new_entry)
            db.commit()
            print(f"📊 Stats mises à jour pour {neighborhood} : {stats.avg_price:.2f} MAD/m2")
            return new_entry
        return None

    def get_market_trends(self, db: Session):
        """Récupère les dernières tendances pour le Dashboard."""
        return db.query(MarketIntelligence).order_by(MarketIntelligence.trend_date.desc()).limit(10).all()