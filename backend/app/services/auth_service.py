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

# --- MODIFICATION ICI : On force l'utilisation de pbkdf2_sha256 ---
# C'est un algorithme très sécurisé qui ne pose jamais de problème d'installation
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

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
            # 1. Décodage sécurisé du jeton JWT
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # 2. Extraction de l'ID (depuis le dictionnaire 'data' passé à create_access_token)
            agent_id_raw = payload.get("id")
            
            if agent_id_raw is None:
                print("⚠️ Security Trace: Token payload is missing 'id'.")
                return None
            
            # 3. Conversion sécurisée en entier pour correspondre au type SQL (Integer)
            try:
                agent_id = int(agent_id_raw)
            except ValueError:
                print(f"⚠️ Security Trace: Received invalid ID format: {agent_id_raw}")
                return None

            # 4. Requête SQL d'identification
            agent = db.query(Agent).filter(Agent.id == agent_id).first()
            
            if not agent:
                print(f"⚠️ Security Trace: No agent found in database with ID {agent_id}.")
                return None
                
            return agent

        except JWTError as e:
            # Si le jeton est expiré ou corrompu, on intercepte l'erreur ici
            print(f"🚫 Identity Verification Failed: {str(e)}")
            return None