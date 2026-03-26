from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.connection import get_db
from app.database.models import UserInteraction, Lead, ActionCategory
from app.services.lead_service import LeadService

router = APIRouter(prefix="/api/leads", tags=["leads"])
lead_service = LeadService()

@router.post("/{lead_id}/simulate-click")
async def simulate_click(lead_id: UUID, db: Session = Depends(get_db)):
    """
    SIMULATION FRONTEND : Enregistre un clic et recalcule le score du client.
    """
    try:
        # 1. On vérifie si le client existe
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead non trouvé")

        # 2. On crée une nouvelle interaction (le clic)
        new_interaction = UserInteraction(
            lead_id=lead_id,
            action_type=ActionCategory.view_property,
            duration_seconds=30
        )
        db.add(new_interaction)
        db.commit()

        # 3. On appelle notre "Agent de Scoring" pour mettre à jour la note
        updated_lead = await lead_service.refresh_lead_intelligence(db, str(lead_id))

        return {
            "message": f"Clic enregistré pour {updated_lead.full_name}",
            "new_ai_score": updated_lead.ai_score,
            "current_status": updated_lead.current_status
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{lead_id}/score")
async def get_lead_score(lead_id: UUID, db: Session = Depends(get_db)):
    """Récupère le score actuel d'un client."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead non trouvé")
    return {"full_name": lead.full_name, "ai_score": lead.ai_score, "status": lead.current_status}