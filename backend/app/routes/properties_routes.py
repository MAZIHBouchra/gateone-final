from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID
import logging
from typing import Optional

# Imports de l'architecture
from app.database.connection import get_db
from app.database.models import Property, AIContentCache, SocialPost, PropertyMedia
from app.services.ai_service import AIService
from app.services.media_service import MediaService
from app.services.seo_service import SEOAnalyzer # <-- Assurez-vous d'avoir cet import aussi
from app.schemas.property_schema import PropertyCreate

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
async def get_ai_article(
    property_id: UUID, 
    is_admin: bool = Query(False), # Paramètre pour différencier l'admin du client
    db: Session = Depends(get_db)
):
    # 1. Recherche de l'article en base
    article = db.query(AIContentCache).filter(
        AIContentCache.property_id == property_id
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="AI Article not ready or missing")

    # 2. LOGIQUE DE PUBLICATION (PROTECTION CLIENT)
    # Si l'utilisateur n'est pas admin et que l'article n'est pas publié
    if not is_admin and not article.is_published:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This analysis is currently being verified by our experts."
        )

    # 3. Récupération des données du bien pour le score SEO
    prop = db.query(Property).filter(Property.id == property_id).first()

    # 4. Calcul dynamique du score
    seo_analysis = SEOAnalyzer.calculate_score(
        article.article_body, 
        prop_type=prop.type, 
        intent="Sale", 
        location=prop.location
    )
        
    return {
        "content": article.article_body,
        "seo_title": article.seo_title,
        "is_published": article.is_published,
        "seo_analysis": seo_analysis 
    }

@router.get("/{property_id}/social-posts")
async def get_social_posts(property_id: UUID, db: Session = Depends(get_db)):
    posts = db.query(SocialPost).filter(SocialPost.property_id == property_id).all()
    if not posts:
        raise HTTPException(status_code=404, detail="Social posts not ready")
    
    return {post.platform.name if hasattr(post.platform, 'name') else post.platform: post.content for post in posts}

# Route pour marquer un post comme publié
@router.put("/social/{post_id}/publish")
async def update_post_status(post_id: int, db: Session = Depends(get_db)):
    post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.status = "published" # On ajoute un champ status à votre table SocialPost
    db.commit()
    return {"status": "success", "message": "Broadcast signal sent to Meta Sync"}
 

@router.put("/{property_id}/approve-article")
async def approve_article(property_id: UUID, db: Session = Depends(get_db)):
    article = db.query(AIContentCache).filter(
        AIContentCache.property_id == property_id
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article.is_published = True
    db.commit()
    
    return {"status": "success", "message": "The intelligence pack is now LIVE on the website."}

# 1. SUPPRIMER UN BIEN
@router.delete("/{property_id}")
async def delete_property(property_id: UUID, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(prop) # Grâce à cascade="all, delete-orphan", les médias et le cache AI sautent aussi !
    db.commit()
    return {"status": "success", "message": "Asset and related intelligence removed."}

# 2. MODIFIER LES INFOS TECHNIQUES (Sans toucher à l'IA pour le moment)
@router.put("/{property_id}")
async def update_property(property_id: UUID, property_in: PropertyCreate, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Mise à jour des champs
    for var, value in property_in.model_dump().items():
        setattr(prop, var, value)
    
    db.commit()
    db.refresh(prop)
    return {"status": "success", "data": prop}


# A. RÉCUPÉRER UN BIEN SEUL (Pour pré-remplir le formulaire d'édition)
@router.get("/{property_id}")
async def get_property(property_id: UUID, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Asset not found")
    return prop

# B. SUPPRESSION (Sécurité Master : Tout ce qui est lié au bien sera supprimé)
@router.delete("/{property_id}")
async def delete_property(property_id: UUID, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(prop)
    db.commit()
    return {"status": "success"}

# C. UPDATE "QUICK SAVE" (Met à jour la fiche technique uniquement)
@router.put("/{property_id}")
async def update_property_specs(property_id: UUID, req: PropertyCreate, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop: raise HTTPException(status_code=404)
    
    data = req.model_dump()
    for key, value in data.items():
        setattr(prop, key, value)
    
    db.commit()
    return {"status": "updated", "id": str(prop.id)}
 
# Route de synchronisation intelligente (Trigger AI Re-run)
@router.put("/{property_id}/sync-ai")
async def sync_property_intelligence(
    property_id: UUID, 
    property_in: PropertyCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # 1. Mise à jour des caractéristiques techniques en base
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Asset coordinates not found")

    data = property_in.model_dump()
    for key, value in data.items():
        setattr(prop, key, value)
    
    # 2. On déclenche la REGÉNÉRATION DU PACK (Article + Social)
    # L'ancienne version dans ai_content_cache sera écrasée (Overwrite logic)
    background_tasks.add_task(
        ai_service.generate_complete_marketing_package,  
        prop.id, 
        data
    )

    db.commit()
    return {"status": "sync_triggered", "message": "Intelligence refresh started in background."}