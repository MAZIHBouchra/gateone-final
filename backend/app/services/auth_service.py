import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from app.database.models import Agent

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "GATEONE_PRESTIGE_SECRET_2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


class AuthService:

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def get_current_agent(db: Session, token: str):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            agent_id_raw = payload.get("id")

            if agent_id_raw is None:
                print("⚠️ Security Trace: Token payload is missing 'id'.")
                return None

            try:
                agent_id = int(agent_id_raw)
            except ValueError:
                print(f"⚠️ Security Trace: Received invalid ID format: {agent_id_raw}")
                return None

            agent = db.query(Agent).filter(Agent.id == agent_id).first()

            if not agent:
                print(f"⚠️ Security Trace: No agent found in database with ID {agent_id}.")
                return None

            return agent

        except JWTError as e:
            print(f"🚫 Identity Verification Failed: {str(e)}")
            return None

    @staticmethod  
    def get_optional_agent(db: Session, token: str):
        """Décode le token sans lever d'exception fatale."""
        if not token:
            return None
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            agent_id = payload.get("id")
            if not agent_id:
                return None
            return db.query(Agent).filter(Agent.id == agent_id).first()
        except (JWTError, Exception):
            return None
    

    @staticmethod
    def decode_access_token(token: str):
        """
        Décode le jeton JWT pour extraire les informations de l'utilisateur.
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None