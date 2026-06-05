from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List
from app.database.connection import get_db
from app.database.models import Agent
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["authentication"])
auth_service = AuthService()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AgentCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    role: str = "agent"  # 'admin' ou 'agent'


@router.post("/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    # 1. Chercher l'agent par email
    agent = db.query(Agent).filter(Agent.email == req.email).first()
    
    # 2. Vérifier si l'agent existe et si le mot de passe est correct
    if not agent or not AuthService.verify_password(req.password, agent.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or security key"
        )

    # 3. Générer le Token JWT
    access_token = AuthService.create_access_token(
        data={"sub": agent.email, "id": agent.id, "role": agent.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "agent": {
            "full_name": f"{agent.first_name} {agent.last_name}",
            "email": agent.email
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