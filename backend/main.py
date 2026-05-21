import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 1. Configuration du PATH (Indispensable pour la Clean Architecture)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 2. Imports des Routeurs (Couche Routing)
from app.routes.chatbot_routes import chatbot_router
from app.routes.email_routes import email_router
from app.routes.price_routes import price_router
from app.routes.leads_routes import router as leads_router
from app.routes.blogs_routes import router as blogs_router
from app.routes.analytics_routes import router as analytics_router
from app.routes.admin_routes import router as admin_router # Le nouveau !

# 3. Gestion des imports optionnels ou complexes
try:
    from app.routes.properties_routes import router as properties_router
    PROPERTIES_AVAILABLE = True
except ImportError as e:
    print(f" Warning: properties routes not loaded: {e}")
    PROPERTIES_AVAILABLE = False

# Import du service chatbot (Cœur IA)
try:
    from app.services import chatbot_api as ca
except ImportError:
    import chatbot_api as ca 

# 4. Initialisation de l'Application
app = FastAPI(
    title="GateOne API - Orchid Island", 
    version="1.1.0",
    description="Unified Backend for AI Real Estate Services"
)

# 5. Configuration CORS (Sécurité)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081", "http://127.0.0.1:8081",
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:8080", "http://127.0.0.1:8080",
        "https://gateone.immo",
        "https://gateone-deploy-production.up.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. Événements de démarrage (Startup)
@app.on_event("startup")
async def startup_event() -> None:
    print(" Starting GateOne unified API with Clean Architecture...")
    success = ca.initialize_rag_system()
    if success:
        print(" AI Chatbot Engine: READY")
    else:
        print(" AI Chatbot Engine: FAILED")

# 7. Enregistrement des Routes (Ordre logique)
app.include_router(admin_router) # On commence par l'Admin
app.include_router(chatbot_router)
app.include_router(email_router)
app.include_router(price_router)
app.include_router(leads_router)
app.include_router(blogs_router)
app.include_router(analytics_router)

if PROPERTIES_AVAILABLE:
    app.include_router(properties_router)

# 8. Endpoints de base (Health & Root)
@app.get("/")
async def root():
    return {
        "status": "online",
        "architecture": "Clean Architecture V1.1",
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "chatbot_initialized": ca.qa_chain is not None
    }

if __name__ == "__main__":
    # Lancement du serveur sur le port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)