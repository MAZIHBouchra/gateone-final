from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from uuid import UUID

# Imports de l'architecture modulaire
from app.database.connection import get_db
from app.database.models import Property
from app.services.ai_service import AIService
from app.schemas.property_schema import PropertyCreate # <--- Import du schéma

router = APIRouter(prefix="/api/properties", tags=["properties"])
ai_service = AIService()

@router.get("/")
async def get_all_properties(db: Session = Depends(get_db)):
    """Récupère la liste de tous les biens en base."""
    return db.query(Property).all()

@router.post("/add-with-ai", status_code=status.HTTP_201_CREATED)
async def add_property_and_marketing_pack(
    property_in: PropertyCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """
    ENDPOINT STRATÉGIQUE : 
    Valide les données, enregistre le bien, et délègue l'IA en tâche de fond.
    """
    try:
        # 1. Extraction des données validées
        property_data = property_in.model_dump()

        # 2. Persistance dans PostgreSQL (Table properties)
        new_prop = Property(
            title=property_data['title'],
            price=property_data['price'],
            location=property_data['location'],
            type=property_data['type'],
            bedrooms=property_data['bedrooms'],
            area_sqm=property_data['area_sqm'],
            description=property_data['features'],
            status="available"
        )
        
        db.add(new_prop)
        db.commit()
        db.refresh(new_prop)

        # 3. ORCHESTRATION IA (Asynchrone)
        # On lance le cycle (Article + Social Media) sans bloquer la réponse API
        background_tasks.add_task(
            ai_service.generate_complete_marketing_package, 
            db, 
            new_prop.id, 
            property_data
        )

        return {
            "status": "success",
            "message": "Property validated and saved. AI generation in progress.",
            "property_id": str(new_prop.id)
        }

    except Exception as e:
        db.rollback()
        print(f" Erreur critique Backend: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Database Transaction Failed"
        )