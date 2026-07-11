from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import desc # Indispensable pour trier les scores
from uuid import UUID
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Architecture Imports
from app.database.connection import get_db
from app.database.models import UserInteraction, Lead, ActionCategory, Property
from app.services.lead_service import LeadIntelligenceService 
from app.services.auth_service import AuthService, oauth2_scheme

router = APIRouter(prefix="/api/leads", tags=["Sales Intelligence"])
lead_intelligence = LeadIntelligenceService()

# --- SCHEMAS ---
class InteractionSchema(BaseModel):
    lead_id: str
    action_type: str 
    property_id: Optional[str] = None
    duration_seconds: Optional[int] = 0

# --- SÉCURITÉ : VÉRIFICATION ADMIN ---
async def get_user_from_header(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = AuthService.get_current_agent(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired. Please log in.")
    return user


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
    payload = AuthService.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    token_user_id = payload.get("id")
    if not token_user_id:
        raise HTTPException(status_code=401, detail="Invalid token structure.")

    if str(token_user_id) != str(data.lead_id):
        raise HTTPException(status_code=403, detail="Forbidden: Identity mismatch.")

    try:
        action = ActionCategory(data.action_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid action type")

    # 1. Création de l'interaction (reste ici, dans la route)
    interaction = UserInteraction(
        lead_id=data.lead_id,
        action_type=action,
        property_id=data.property_id,
        duration_seconds=data.duration_seconds,
        timestamp=datetime.utcnow()
    )
    db.add(interaction)
    db.commit()

    # 2. Recalcul du score (le service ne crée plus d'interaction, juste le calcul)
    lead = await LeadIntelligenceService.recalculate_score(db, data.lead_id)

    return {
        "status": "tracked",
        "action": data.action_type,
        "new_score": lead.ai_score if lead else None
    }

@router.get("/")
async def get_all_leads(db: Session = Depends(get_db), current_admin = Depends(get_user_from_header)):
    leads = db.query(Lead).order_by(desc(Lead.ai_score)).all()

    result = []
    for l in leads:
        # On cherche sa dernière interaction pour le dashboard
        last_inter = db.query(UserInteraction).filter(UserInteraction.lead_id == l.id)\
            .order_by(desc(UserInteraction.timestamp)).first()

        # Jointure : on récupère le titre du bien lié à cette interaction, si présent
        interest_label = "No property viewed yet"
        if last_inter and last_inter.property_id:
            prop = db.query(Property).filter(Property.id == last_inter.property_id).first()
            if prop:
                interest_label = prop.title

        result.append({
            "id": str(l.id),
            "full_name": l.full_name,
            "email": l.email,
            "current_status": l.current_status,
            "ai_score": float(l.ai_score or 0),
            "interest": interest_label,
            "last_action": last_inter.action_type.name if last_inter else "No action yet",
            "last_action_time": last_inter.timestamp.strftime("%Y-%m-%d %H:%M") if last_inter else "N/A"
        })
    return result

# Dans app/routes/leads_routes.py

@router.get("/{lead_id}/intelligence")
async def get_lead_analysis(
    lead_id: UUID, 
    db: Session = Depends(get_db), 
    current_admin = Depends(get_user_from_header)
):
    # 1. Récupérer le Lead
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead data missing.")

    # 2. Récupérer l'historique des interactions (jointure avec les biens si possible)
    interactions = db.query(UserInteraction).filter(
        UserInteraction.lead_id == lead_id
    ).order_by(desc(UserInteraction.timestamp)).all()

    # 3. Préparer le détail du score pour le graphique/rapport
    history = []
    for i in interactions:
        history.append({
            "action": i.action_type.name.replace('_', ' ').title(),
            "time": i.timestamp.strftime("%Y-%m-%d %H:%M"),
            "property_id": str(i.property_id) if i.property_id else None
        })

    # Logic : Identification du Tier Financier (pour affichage propre)
    tier_label = "VIP Elite" if lead.financial_points >= 50 else "Institutional" if lead.financial_points >= 30 else "Standard"

    return {
        "full_name": lead.full_name,
        "email": lead.email,
        "status": lead.current_status,
        "total_score": float(lead.ai_score or 0),
        "financial": {
            "tier": tier_label,
            "points": lead.financial_points
        },
        "behavioral": {
            "points": lead.behavioral_points,
            "actions_count": len(interactions)
        },
        "history": history[:5],
        "history_truncated": len(interactions) > 5 
    }