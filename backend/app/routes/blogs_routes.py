from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database.connection import get_db
from app.services.blog_service import BlogService
from uuid import UUID
from app.database.models import Blog, BlogStatus
from sqlalchemy import desc

router = APIRouter(prefix="/api/blogs", tags=["blogs"])
blog_service = BlogService()

# 1. On définit le schéma de données
class BlogSchema(BaseModel):
    topic: str
    region: str
    keywords: List[str]

# 2. On force l'utilisation du Body JSON
@router.post("/generate-expert", status_code=status.HTTP_201_CREATED)
async def generate_industrial_blog_api(
    # Le "= Body(...)" est l'assurance anti-erreur 422
    req: BlogSchema = Body(...), 
    db: Session = Depends(get_db)
):
    try:
        print(f"📥 Backend: Request received for '{req.topic}'")
        
        data = await blog_service.generate_industrial_blog(
            db, 
            topic=req.topic, 
            region=req.region, 
            keywords=req.keywords
        )
        
        # On renvoie une structure propre
        return {
            "status": "success",
            "data": data
        }
    except Exception as e:
        print(f"❌ Backend Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
 
@router.put("/{blog_id}/publish")
async def publish_blog(blog_id: UUID, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    blog.status = BlogStatus.published
    db.commit()
    
    return {"status": "success", "message": "Article is now live for clients"}




@router.get("/public/blogs")
async def get_public_blogs(db: Session = Depends(get_db)):
    """Blogs publiés pour les clients (Sans Authentification)"""
    blogs = (
        db.query(Blog)
        .filter(Blog.status == BlogStatus.published)
        .order_by(desc(Blog.created_at))
        .all()
    )
    return [
        {
            "id": str(blog.id),
            "topic": blog.topic,
            "seo_title": blog.seo_title,
            "content": blog.content,
            "target_region": blog.target_region,
            "created_at": blog.created_at.isoformat() if blog.created_at else None,
        }
        for blog in blogs
    ]


@router.get("/{blog_id}")
async def get_blog_by_id(blog_id: UUID, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
        
    return {
        "id": str(blog.id),
        "topic": blog.topic,
        "seo_title": blog.seo_title,
        "content": blog.content,
        "target_region": blog.target_region,
        "created_at": blog.created_at.strftime("%d/%m/%Y")
    }