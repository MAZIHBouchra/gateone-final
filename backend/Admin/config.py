"""
Configuration centralisée pour l'application
"""

import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

# Configuration MongoDB Atlas
MONGO_URI = "mongodb+srv://orchidland55_db_user:wXw52DtrnbrDBk80@cluster0.c7pm1fd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Nom de la base de données
DATABASE_NAME = "real_estate"

# Configuration CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",     # React (Create React App)
    "http://localhost:5173",     # Vite
    "http://localhost:8080",     # Port personnalisé
    "http://localhost:8081",     # Port alternatif
    "http://127.0.0.1:3000",     # Adresse alternative
    "http://127.0.0.1:5173",     # Vite alternative
    "https://gateone.immo",      # Domaine production
    "https://gateone-deploy-production.up.railway.app",  # API Railway
]

# Identifiants admin
ADMIN_EMAIL = "GetOne@gmail.com"
ADMIN_PASSWORD = "GetOne2025"

# Configuration serveur
HOST = "0.0.0.0"
PORT = 8000
