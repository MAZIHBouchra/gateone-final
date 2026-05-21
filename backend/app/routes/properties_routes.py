from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
import logging
from typing import Optional

# Imports de l'architecture
from app.database.connection import get_db
from app.database.models import Property, AIContentCache, SocialPost, PropertyMedia
from app.services.ai_service import AIService
from app.services.media_service import MediaService # Ton nouveau service Cloudinary

from sqlalchemy.orm import joinedload # Importation importante

router = APIRouter(prefix="/api/properties", tags=["properties"])
ai_service = AIService()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_all_properties(db: Session = Depends(get_db)):
    """
    Récupère la liste de tous les biens en incluant les médias
    pour afficher la photo principale directement.
    """
    properties = db.query(Property).options(joinedload(Property.media)).order_by(desc(Property.id)).all()
    
    # On reformate légèrement pour que le front ait 'thumbnail_url' facilement
    result = []
    for prop in properties:
        # On cherche l'image qui est définie comme miniature
        thumb = next((m.cloudinary_url for m in prop.media if m.is_thumbnail), None)
        # Si pas de miniature, on prend la toute première photo, sinon rien
        if not thumb and prop.media:
            thumb = prop.media[0].cloudinary_url
            
        prop_dict = {
            "id": str(prop.id),
            "title": prop.title,
            "price": float(prop.price),
            "location": prop.location,
            "neighborhood": prop.neighborhood,
            "type": prop.type,
            "area_sqm": prop.area_sqm,
            "status": prop.status,
            "thumbnail_url": thumb # Voilà notre nouveau champ pour le Frontend !
        }
        result.append(prop_dict)
        
    return result

@router.post("/add-with-ai", status_code=status.HTTP_201_CREATED)
async def add_property_and_marketing_pack(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    # Utilisation de Form car on envoie un fichier (multipart/form-data)
    title: str = Form(...),
    price: float = Form(...),
    location: str = Form(...),
    neighborhood: str = Form(...),
    type: str = Form(...),
    bedrooms: int = Form(...),
    bathrooms: int = Form(0),
    area_sqm: int = Form(...),
    features: str = Form(...),
    intent: str = Form("Sale"),
    image: Optional[UploadFile] = File(None) # L'image est optionnelle pour éviter les crashs
):
    """
    ENDPOINT DE HAUTE TECHNOLOGIE (Module 3 & 9):
    1. Reçoit les specs et l'image.
    2. Upload sur Cloudinary (Intelligence Visuelle).
    3. Enregistre le bien et le lien média en DB.
    4. Lance l'IA (Mistral Large) en tâche de fond.
    """
    try:
        # --- 1. GESTION DE L'IMAGE (CLOUDINARY) ---
        image_url = None
        if image:
            logger.info(f" Uploading image for property: {title}")
            file_bytes = await image.read()
            image_url = await MediaService.upload_property_photo(file_bytes, title)

        # --- 2. CRÉATION DE LA PROPRIÉTÉ ---
        new_prop = Property(
            title=title,
            price=price,
            location=location,
            neighborhood=neighborhood,
            type=type,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            area_sqm=area_sqm,
            description=features, # On stocke les atouts IA ici
            status="available"
        )
        
        db.add(new_prop)
        db.flush() # On récupère l'ID sans commiter tout de suite

        # --- 3. LIEN AVEC LE MÉDIA ---
        if image_url:
            new_media = PropertyMedia(
                property_id=new_prop.id,
                cloudinary_url=image_url,
                is_thumbnail=True
            )
            db.add(new_media)

        db.commit()
        db.refresh(new_prop)

        # --- 4. LANCEMENT IA (BACKGROUND) ---
        # On prépare l'objet DATA pour ton AIService actuel
        property_data = {
            "title": title,
            "price": price,
            "location": location,
            "neighborhood": neighborhood,
            "type": type,
            "intent": intent,
            "area_sqm": area_sqm,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "features": features
        }

        background_tasks.add_task(
            ai_service.generate_complete_marketing_package,  
            new_prop.id, 
            property_data
        )

        return {
            "status": "success",
            "property_id": str(new_prop.id),
            "image_url": image_url,
            "message": "Property and Image saved. AI engine started."
        }

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Critical Error in /add-with-ai: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database or Upload failed: {str(e)}")

@router.get("/{property_id}/ai-article")
async def get_ai_article(property_id: UUID, db: Session = Depends(get_db)):
    article = db.query(AIContentCache).filter(AIContentCache.property_id == property_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="AI Article not ready")
        
    return {
        "content": article.article_body,
        "seo_title": article.seo_title,
        "language": article.language,
        "generated_at": article.generated_at.strftime("%Y-%m-%d %H:%M") if article.generated_at else "Recently"
    }

@router.get("/{property_id}/social-posts")
async def get_social_posts(property_id: UUID, db: Session = Depends(get_db)):
    posts = db.query(SocialPost).filter(SocialPost.property_id == property_id).all()
    if not posts:
        raise HTTPException(status_code=404, detail="Social posts not ready")
    
    return {post.platform.name if hasattr(post.platform, 'name') else post.platform: post.content for post in posts}