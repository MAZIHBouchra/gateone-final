from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/blogs", tags=["blogs"])
ai_service = AIService()

@router.post("/generate-expert", status_code=status.HTTP_201_CREATED)
async def generate_industrial_blog(
    topic: str, 
    region: str, # "Africa", "Gulf", "Morocco_MRE"
    focus_keyword: str,
    db: Session = Depends(get_db)
):
    """
    Industrialisation du Blog : Génère l'article expert, le pack social et sauvegarde en DB.
    """
    try:
        # On définit les mots-clés secondaires pour l'IA
        keywords = [focus_keyword, "Marrakech investment", "Luxury Real Estate"]
        
        # On lance la machine
        blog_data = await ai_service.generate_expert_blog_workflow(db, topic, region, keywords)
        
        return {
            "status": "success",
            "message": "Expert blog and social pack generated and cached.",
            "data": blog_data
        }
    except Exception as e:
        print(f" Erreur Blog : {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate industrial blog content")