from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.connection import get_db
from app.database.models import Property
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/properties", tags=["properties"])
ai_service = AIService()

@router.get("/")
async def get_all_properties(db: Session = Depends(get_db)):
    return db.query(Property).all()

@router.post("/add-with-ai")
async def add_property_and_generate_content(
    property_data: dict, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """
    Tâche Spécifique : Ajouter un bien et déclencher l'IA Marketing en arrière-plan.
    """
    try:
        # 1. Enregistrement immédiat du bien dans PostgreSQL
        new_prop = Property(
            title=property_data.get('title'),
            price=property_data.get('price'),
            location=property_data.get('location'),
            type=property_data.get('type'),
            bedrooms=property_data.get('bedrooms'),
            bathrooms=property_data.get('bathrooms'), # Ajouté pour la cohérence
            area_sqm=property_data.get('area_sqm')
        )
        
        db.add(new_prop)
        db.commit()
        db.refresh(new_prop)

        # 2. Lancement de l'IA en tâche de fond
        # Note : On ne passe pas 'db', le service utilisera 'SessionLocal' en interne
        background_tasks.add_task(
            ai_service.generate_and_save_workflow, # On appellera une fonction dédiée
            new_prop.id, 
            property_data
        )

        return {
            "status": "success",
            "message": "Property added. AI generation started in background.",
            "property_id": str(new_prop.id)
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erreur creation property: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create property")