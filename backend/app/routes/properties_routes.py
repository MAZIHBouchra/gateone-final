from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from sqlalchemy import desc # Ajouté pour le tri
from uuid import UUID
import logging

from app.database.connection import get_db
from app.database.models import Property, AIContentCache, SocialPost
from app.services.ai_service import AIService
from app.schemas.property_schema import PropertyCreate

router = APIRouter(prefix="/api/properties", tags=["properties"])
ai_service = AIService()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_all_properties(db: Session = Depends(get_db)):
    """
    Récupère la liste de tous les biens.
    Note : On pourrait ajouter .order_by(desc(Property.id)) si nécessaire.
    """
    return db.query(Property).all()

@router.post("/add-with-ai", status_code=status.HTTP_201_CREATED)
async def add_property_and_marketing_pack(
    property_in: PropertyCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    try:
        property_data = property_in.model_dump()

        new_prop = Property(
            title=property_data['title'],
            price=property_data['price'],
            location=property_data['location'],
            neighborhood=property_data.get('neighborhood'),
            type=property_data['type'],
            bedrooms=property_data['bedrooms'],
            bathrooms=property_data.get('bathrooms', 0),
            area_sqm=property_data['area_sqm'],
            description=property_data['features'],
            status=property_data.get('status', 'available')
        )
        
        db.add(new_prop)
        db.commit()
        db.refresh(new_prop)

        background_tasks.add_task(
            ai_service.generate_complete_marketing_package,  
            new_prop.id, 
            property_data
        )

        return {
            "status": "success",
            "message": "Property saved. AI generation started.",
            "property_id": str(new_prop.id)
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error adding property: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{property_id}/ai-article")
async def get_ai_article(property_id: UUID, db: Session = Depends(get_db)):
    article = db.query(AIContentCache).filter(
        AIContentCache.property_id == property_id
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="AI Article not ready")
        
    return {
        "content": article.article_body,
        "seo_title": article.seo_title,
        "language": article.language,
        # ON AJOUTE LA DATE ICI pour l'affichage "Last AI Update" dans le Frontend
        "generated_at": article.generated_at.strftime("%Y-%m-%d %H:%M") if article.generated_at else "Recently"
    }

@router.get("/{property_id}/social-posts")
async def get_social_posts(property_id: UUID, db: Session = Depends(get_db)):
    posts = db.query(SocialPost).filter(SocialPost.property_id == property_id).all()
    
    if not posts:
        raise HTTPException(status_code=404, detail="Social posts not ready")
    
    return {post.platform.name if hasattr(post.platform, 'name') else post.platform: post.content for post in posts}