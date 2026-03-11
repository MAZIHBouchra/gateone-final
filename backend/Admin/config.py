import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# ---- Base de données ----
# On ne met PLUS de valeur par défaut avec le mot de passe !
MONGO_URI = os.getenv("MONGO_URI") 
DATABASE_NAME = os.getenv("DATABASE_NAME", "real_estate")

# ---- Admin ----
# On retire les identifiants en dur
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

# ---- Serveur ----
HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", 8000))

# ---- CORS ----
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "https://gateone.immo",
    "https://gateone-deploy-production.up.railway.app",
]