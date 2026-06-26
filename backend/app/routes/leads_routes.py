from fastapi import APIRouter, HTTPException, Depends, status, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import Optional
from app.database.connection import get_db
from app.database.models import UserInteraction, Lead, ActionCategory
# --- CORRECTION DE L'IMPORTATION ---
from app.services.lead_service import LeadIntelligenceService 
from app.services.auth_service import AuthService, oauth2_scheme
from datetime import datetime

router = APIRouter(prefix="/api/leads", tags=["Sales Intelligence"])
# Utilisation du nouveau nom de classe "Intelligence"
lead_intelligence = LeadIntelligenceService()

class InteractionSchema(BaseModel):
    lead_id: str
    action_type: str  # "view_property", "click_whatsapp", etc.
    property_id: Optional[str] = None
    duration_seconds: Optional[int] = 0


@router.get("/{lead_id}/intelligence-report")
async def get_lead_score_report(lead_id: UUID, db: Session = Depends(get_db)):
    """
    Fournit le diagnostic complet de l'IA pour un prospect spécifique.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Prospect records unavailable.")
        
    return {
        "identity": lead.full_name,
        "email": lead.email,
        "behavioral_performance": lead.behavioral_points, # S_behavioral
        "financial_capability": lead.financial_points,     # S_financial
        "global_ai_score": float(lead.ai_score),           # S_total
        "current_priority": "High" if lead.ai_score >= 80 else "Normal",
        "current_status": lead.current_status
    }

@router.post("/interaction")
async def log_interaction(
    data: InteractionSchema,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    #  TEST DE RÉCEPTION
    print(
        f" SIGNAL REÇU ! "
        f"Action: {data.action_type} | "
        f"Lead: {data.lead_id} | "
        f"Property: {data.property_id}"
    )

    # Décodage du JWT
    payload = AuthService.decode_access_token(token)

    if not payload:
        print(" ÉCHEC : Jeton invalide ou expiré")
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )

    print(f" JWT décodé : {payload}")

    # ID contenu dans le JWT
    token_user_id = payload.get("id")

    if not token_user_id:
        print(" ÉCHEC : Structure du JWT invalide")
        raise HTTPException(
            status_code=401,
            detail="Invalid token structure."
        )

    print(f" Utilisateur du token : {token_user_id}")

    # Vérification d'identité
    if str(token_user_id) != str(data.lead_id):
        print(
            f" FORBIDDEN : "
            f"token={token_user_id} "
            f"≠ lead_id={data.lead_id}"
        )

        raise HTTPException(
            status_code=403,
            detail="Forbidden: Identity mismatch."
        )

    # Validation du type d'action
    try:
        action = ActionCategory(data.action_type)
        print(f" Action valide : {action}")
    except ValueError:
        print(f" Type d'action invalide : {data.action_type}")

        raise HTTPException(
            status_code=400,
            detail="Invalid action type"
        )

    # Création de l'interaction
    interaction = UserInteraction(
        lead_id=data.lead_id,
        action_type=action,
        property_id=data.property_id,
        duration_seconds=data.duration_seconds,
        timestamp=datetime.utcnow()
    )

    db.add(interaction)
    db.commit()

    print(" Interaction enregistrée en base de données")

    # Mise à jour de l'intelligence du lead
    await LeadIntelligenceService.log_interaction(
        db,
        data.lead_id,
        action
    )

    print(" Intelligence du lead mise à jour")

    return {
        "status": "tracked",
        "action": data.action_type
    }