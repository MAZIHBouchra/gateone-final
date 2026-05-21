from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database.connection import get_db
from app.database.models import Agent
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

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