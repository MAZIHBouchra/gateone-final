import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CONFIGURATION DU CHEMIN .ENV ---
# On détermine le chemin absolu du fichier .env (un dossier au-dessus de 'database')
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / '.env'

# Chargement des variables d'environnement
load_dotenv(dotenv_path=env_path)

# Récupération de l'URL de la base de données
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# --- VÉRIFICATION DE SÉCURITÉ ---
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(
        "CRITICAL ERROR: DATABASE_URL is not defined in the .env file. "
        "Check its location: " + str(env_path)
    )

# --- ARCHITECTURE SQLALCHEMY ---

# 1. Création du moteur (Engine)
# Pour PostgreSQL, on n'a pas besoin de 'check_same_thread' comme sur SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 2. Création de la fabrique de sessions (SessionLocal)
# On désactive autocommit et autoflush pour avoir un contrôle total sur les transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Classe de base pour les modèles
# Tous les modèles (Property, Lead, etc.) hériteront de cette classe
Base = declarative_base()

# 4. Injection de Dépendance (FastAPI Dependency)
# Cette fonction gère le cycle de vie de la connexion : 
# elle l'ouvre au début de la requête et la ferme AUTOMATIQUEMENT à la fin.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()