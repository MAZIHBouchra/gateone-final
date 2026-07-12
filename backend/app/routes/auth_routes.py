from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List
from app.database.connection import get_db
from app.database.models import Agent, Lead 
from app.services.auth_service import AuthService
from .properties_routes import get_current_user 
from app.services.lead_service import LeadIntelligenceService

router = APIRouter(prefix="/api/auth", tags=["authentication"])
auth_service = AuthService()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class ResetPassRequest(BaseModel):
    new_password: str


class AgentCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str = "agent"  # 'admin' ou 'agent'

# Schéma pour l'inscription client
class ClientSignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    budget_tier: str # 'VIP', 'PREMIUM', 'STANDARD', 'ENTRY'

class ResetClientPassword(BaseModel):
    email: EmailStr
    new_password: str


@router.post("/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    # 1. Chercher l'agent
    agent = db.query(Agent).filter(Agent.email == req.email).first()
    if not agent or not AuthService.verify_password(req.password, agent.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect credentials")

    # 2. GÉNÉRATION DU TOKEN (C'est ici qu'il faut définir la variable 'token')
    token = AuthService.create_access_token(
        data={"sub": agent.email, "id": agent.id, "role": agent.role}
    )

    # 3. RENVOYER LA RÉPONSE (Ici, 'token' sera maintenant reconnu)
    return {
        "access_token": token,
        "token_type": "bearer",
        "agent": {
            "full_name": f"{agent.first_name} {agent.last_name}",
            "email": agent.email,
            "role": agent.role  # N'oublie pas cette ligne pour React !
        }
    }

# 1. RÉCUPÉRER TOUS LES AGENTS (ADMIN SEULEMENT)
@router.get("/agents", response_model=List[dict])
async def list_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).all()
    return [
        {"id": a.id, "first_name": a.first_name, "last_name": a.last_name, "email": a.email, "role": a.role, "is_active": True} 
        for a in agents
    ]

# 2. CRÉER UN NOUVEL AGENT (ADMIN SEULEMENT)
@router.post("/register")
async def register_agent(req: AgentCreate, db: Session = Depends(get_db)):
    # Vérifier si l'email existe déjà
    db_agent = db.query(Agent).filter(Agent.email == req.email).first()
    if db_agent:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_agent = Agent(
        first_name=req.first_name,
        last_name=req.last_name,
        email=req.email,
        hashed_password=AuthService.get_password_hash(req.password),
        role=req.role
    )
    db.add(new_agent)
    db.commit()
    return {"status": "success", "message": f"Agent {req.first_name} created successfully"}

@router.put("/profile/password")
async def update_password(
    req: PasswordUpdate, 
    db: Session = Depends(get_db), 
    current_agent = Depends(get_current_user) # Vérifie que c'est bien l'agent lui-même
):
    # 1. Vérification de l'ancien mot de passe
    if not AuthService.verify_password(req.current_password, current_agent.hashed_password):
        raise HTTPException(
            status_code=400, 
            detail="Current security key is incorrect. Access denied."
        )

    # 2. Hachage du nouveau mot de passe
    new_hashed = AuthService.get_password_hash(req.new_password)
    
    # 3. Sauvegarde en base de données
    current_agent.hashed_password = new_hashed
    db.commit()

    print(f" Security: Password rotated for agent {current_agent.email}")
    return {"status": "success", "message": "Credentials updated successfully."}

@router.put("/agents/{agent_id}/reset-password")
async def admin_reset_password(
    agent_id: int, 
    req: ResetPassRequest, 
    db: Session = Depends(get_db), 
    current_admin = Depends(get_current_user)
):
    # Seul l'admin peut réinitialiser le pass d'un autre
    if current_admin.role != "admin":
        raise HTTPException(status_code=403, detail="Clearance restricted.")

    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found.")

    # Hachage et sauvegarde
    agent.hashed_password = AuthService.get_password_hash(req.new_password)
    db.commit()
    
    return {"status": "success", "message": "Credential successfully rotated by Admin."}

@router.delete("/agents/{agent_id}")
async def delete_agent(
    agent_id: int, 
    db: Session = Depends(get_db), 
    current_admin = Depends(get_current_user)
):
    # 1. Sécurité : Vérifier le rôle Admin
    if current_admin.role != "admin":
        raise HTTPException(status_code=403, detail="Administrative privileges required.")

    # 2. Sécurité : Empêcher l'auto-suppression
    if agent_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Identity Protection: You cannot delete your own administrative account.")

    # 3. Rechercher et supprimer
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent profile not found.")

    db.delete(agent)
    db.commit()
    
    print(f" Profile De-provisioned: {agent.email} by {current_admin.first_name}")
    return {"status": "success", "message": "The associate's access has been permanently revoked."}


@router.post("/client/signup")
async def client_signup(req: ClientSignupRequest, db: Session = Depends(get_db)):
    # 1. Vérification doublon
    if db.query(Lead).filter(Lead.email == req.email).first():
        raise HTTPException(status_code=400, detail="Investor email already registered")

    # 2. Calcul immédiat du Score Financier (Algorithme Chapitre 4)
    fin_points = LeadIntelligenceService.calculate_financial_score(req.budget_tier)

    # 3. Création du compte Lead/Client
    new_lead = Lead(
        full_name=req.full_name,
        email=req.email,
        hashed_password=AuthService.get_password_hash(req.password),
        financial_points=fin_points, # Stockage S_financial
        ai_score=float(fin_points),  # Score total de départ
        current_status="new"
    )
    
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    
    return {"status": "success", "message": "Account secured in the Private Circle"}

@router.post("/client/login")
async def client_login(req: LoginRequest, db: Session = Depends(get_db)):
    # 1. On cherche l'investisseur (Lead)
    client = db.query(Lead).filter(Lead.email == req.email).first()
    
    if not client or not AuthService.verify_password(req.password, client.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")

    # 2. Génération du token
    token = AuthService.create_access_token(
        data={"sub": client.email, "id": str(client.id), "role": "client"}
    )

    # 3. RETOUR DE LA RÉPONSE (C'est ici qu'on ajoute l'ID)
    return {
        "access_token": token,
        "token_type": "bearer",
        "client_id": str(client.id),   
        "client_name": client.full_name,
        "role": "client"
    }


@router.put("/client/reset-password")
async def client_reset_password(
    req: ResetClientPassword,
    db: Session = Depends(get_db)
):
    """
    Reset investor password.
    """

    # Validation minimale du mot de passe
    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters."
        )

    try:
        # Recherche du client
        client = db.query(Lead).filter(
            Lead.email == req.email
        ).first()

        # Bonne pratique :
        # On ne révèle pas si l'email existe ou non
        if client:
            client.hashed_password = AuthService.get_password_hash(
                req.new_password
            )
            db.commit()

            logger.info(
                f"Password successfully reset for investor: {req.email}"
            )
        else:
            logger.warning(
                f"Password reset requested for unknown email: {req.email}"
            )

        # Réponse générique
        return {
            "status": "success",
            "message": (
                "If an account associated with this email exists, "
                "its credentials have been updated."
            )
        }

    except Exception as e:
        db.rollback()

        logger.error(
            f"Password reset failed for {req.email}: {str(e)}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process password reset request."
        )