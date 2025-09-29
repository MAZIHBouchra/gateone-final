import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# ---- Base de données ----
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://orchidland55_db_user:wXw52DtrnbrDBk80@cluster0.c7pm1fd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
DATABASE_NAME = os.getenv("DATABASE_NAME", "real_estate")

# ---- CORS ----
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://gateone.immo",
    "https://gateone-deploy-production.up.railway.app",
]

# ---- Admin ----
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "GetOne@gmail.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "GetOne2025")

# ---- Serveur ----
HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", 8000))  # Railway fournit PORT automatiquement
