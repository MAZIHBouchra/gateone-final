from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status, UploadFile, File, Form, Query, Body
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from uuid import UUID
import logging
from typing import Optional, List
from pydantic import BaseModel 
from fastapi.security import OAuth2PasswordBearer

# Imports de l'architecture
from app.database.connection import get_db
from app.database.models import Property, AIContentCache, SocialPost, PropertyMedia
from app.services.ai_service import AIService
from app.services.media_service import MediaService
from app.services.seo_service import SEOAnalyzer 
from app.schemas.property_schema import PropertyCreate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/properties", tags=["properties"])
ai_service = AIService()
logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# --- SCHÉMAS PYDANTIC ---
class ContentApprovalUpdate(BaseModel):
    content: str

class PublishRequest(BaseModel):
    content: Optional[str] = None

# --- DÉPENDANCE DE SÉCURITÉ ---
async def get_user_from_header(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = AuthService.get_current_agent(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized identity")
    return user

# =================================================================
# 1. ROUTES STATIQUES (SANS PARAMÈTRE {ID}) - TOUJOURS EN PREMIER
# =================================================================

@router.get("/public")
async def get_public_catalog(db: Session = Depends(get_db)):
    """Catalogue pour les clients (Sans Authentification)"""
    properties = (
        db.query(Property)
        .options(joinedload(Property.media))
        .filter(Property.status == "available")
        .order_by(desc(Property.id))
        .all()
    )
    result = []
    for prop in properties:
        thumb = next((m.cloudinary_url for m in prop.media if m.is_thumbnail), None)
        if not thumb and prop.media:
            thumb = prop.media[0].cloudinary_url
        result.append({
            "id": str(prop.id), "title": prop.title, "price": float(prop.price),
            "location": prop.location, "neighborhood": prop.neighborhood,
            "type": prop.type, "area_sqm": prop.area_sqm, "status": prop.status,
            "thumbnail_url": thumb, "curator": "GateOne Premium"
        })
    return result

@router.get("/")
async def list_properties_admin(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
):
    """Liste filtrée pour le dashboard Agent/Admin (Authentification requise)"""
    current_agent = AuthService.get_current_agent(db, token)
    if not current_agent:
        raise HTTPException(status_code=401)

    query = db.query(Property).options(joinedload(Property.media))
    if current_agent.role != "admin":
        query = query.filter(Property.agent_id == current_agent.id)
    
    properties = query.order_by(desc(Property.id)).all()
    
    result = []
    for prop in properties:
        thumb = next((m.cloudinary_url for m in prop.media if m.is_thumbnail), None)
        curator = f"{current_agent.first_name} (Self)" if prop.agent_id == current_agent.id else "Agent"
        result.append({
            "id": str(prop.id), "title": prop.title, "price": float(prop.price),
            "location": prop.location, "neighborhood": prop.neighborhood,
            "type": prop.type, "area_sqm": prop.area_sqm, "status": prop.status,
            "thumbnail_url": thumb, "curator": curator
        })
    return result

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # On décode le Token JWT envoyé par le front
    user = AuthService.get_current_agent(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forbidden identity. Session expired or compromised.",
        )
    return user

# =================================================================
# 2. ROUTES DE CRÉATION ET MODIFICATION
# =================================================================

@router.post("/add-with-ai", status_code=status.HTTP_201_CREATED)
async def add_property(
    background_tasks: BackgroundTasks, db: Session = Depends(get_db),
    current_agent = Depends(get_user_from_header), 
    title: str = Form(...), price: float = Form(...), location: str = Form(...),
    neighborhood: str = Form(...), type: str = Form(...), bedrooms: int = Form(...),
    bathrooms: int = Form(0), area_sqm: int = Form(...), features: str = Form(...),
    intent: str = Form("Sale"), image: Optional[UploadFile] = File(None)
):
    try:
        image_url = None
        if image:
            file_bytes = await image.read()
            image_url = await MediaService.upload_property_photo(file_bytes, title)

        new_prop = Property(
            title=title, price=price, location=location, neighborhood=neighborhood,
            type=type, bedrooms=bedrooms, bathrooms=bathrooms, area_sqm=area_sqm,
            description=features, status="available", agent_id=current_agent.id
        )
        db.add(new_prop)
        db.flush() 

        if image_url:
            new_media = PropertyMedia(property_id=new_prop.id, cloudinary_url=image_url, is_thumbnail=True)
            db.add(new_media)

        db.commit()
        db.refresh(new_prop)

        # Lancement IA
        property_data = {
            "title": title, "price": price, "location": location, "neighborhood": neighborhood, 
            "type": type, "intent": intent, "area_sqm": area_sqm, "bedrooms": bedrooms, 
            "bathrooms": bathrooms, "features": features
        }
        background_tasks.add_task(ai_service.generate_complete_marketing_package, new_prop.id, property_data)

        return {"status": "success", "property_id": str(new_prop.id)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{property_id}/sync-ai")
async def sync_ai(property_id: UUID, req: PropertyCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop: raise HTTPException(status_code=404)
    for key, value in req.model_dump().items(): setattr(prop, key, value)
    background_tasks.add_task(ai_service.generate_complete_marketing_package, prop.id, req.model_dump())
    db.commit()
    return {"status": "sync_triggered"}

@router.put("/{property_id}/approve-article")
async def approve_article(property_id: UUID, req: PublishRequest = Body(...), db: Session = Depends(get_db)):
    article = db.query(AIContentCache).filter(AIContentCache.property_id == property_id).order_by(desc(AIContentCache.id)).first()
    if not article: raise HTTPException(status_code=404)
    if req.content: article.article_body = req.content
    article.is_published = True
    db.commit()
    return {"status": "success"}

# =================================================================
# 3. ROUTES DYNAMIQUES AVEC {ID} - TOUJOURS EN DERNIER
# =================================================================

@router.get("/{property_id}/ai-article")
async def get_ai_article(property_id: UUID, is_admin: bool = Query(False), db: Session = Depends(get_db)):
    article = db.query(AIContentCache).filter(AIContentCache.property_id == property_id).order_by(desc(AIContentCache.id)).first()
    if not article: raise HTTPException(status_code=404)
    if not is_admin and not article.is_published:
        raise HTTPException(status_code=403, detail="Not published")
    prop = db.query(Property).filter(Property.id == property_id).first()
    seo = SEOAnalyzer.calculate_score(article.article_body, prop.type, "Sale", prop.location)
    return {"content": article.article_body, "seo_title": article.seo_title, "is_published": article.is_published, "seo_analysis": seo}

@router.get("/{property_id}/social-posts")
async def get_social_posts(property_id: UUID, db: Session = Depends(get_db)):
    posts = db.query(SocialPost).filter(SocialPost.property_id == property_id).all()
    if not posts: raise HTTPException(status_code=404)
    return {post.platform.name if hasattr(post.platform, 'name') else post.platform: post.content for post in posts}

@router.get("/{property_id}")
async def get_property_by_id(property_id: UUID, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop: raise HTTPException(status_code=404)
    return prop

@router.delete("/{property_id}")
async def delete_property_secure(property_id: UUID, db: Session = Depends(get_db), current_agent = Depends(get_user_from_header)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop: raise HTTPException(status_code=404)
    if current_agent.role != "admin" and prop.agent_id != current_agent.id:
        raise HTTPException(status_code=403)
    db.delete(prop)
    db.commit()
    return {"status": "success"}
    

# C. UPDATE "QUICK SAVE" (Logic 2: Ownership validation)
@router.put("/{property_id}") # <-- Assure-toi que c'est bien @router.put et l'ID entre accolades
async def update_property_specs(
    property_id: UUID, 
    req: PropertyCreate, 
    db: Session = Depends(get_db),
    current_agent = Depends(get_current_user) # On sécurise la route
):
    # 1. Rechercher le bien
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Asset coordinates not found.")

    # 2. VÉRIFICATION RBAC (Sécurité Master)
    if current_agent.role != "admin" and prop.agent_id != current_agent.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Forbidden: Identity mismatch. Access to update restricted."
        )

    # 3. Mise à jour des champs techniques
    data = req.model_dump()
    for key, value in data.items():
        setattr(prop, key, value)
    
    db.commit()
    print(f" Asset Refined: {prop.title} updated by {current_agent.first_name}")
    
    return {"status": "success", "id": str(prop.id), "message": "The asset vault has been updated."}