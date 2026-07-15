import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 1. Configuration du PATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 2. Imports des Routeurs
from app.routes.email_routes import email_router
from app.routes.leads_routes import router as leads_router
from app.routes.blogs_routes import router as blogs_router
from app.routes.analytics_routes import router as analytics_router
from app.routes.admin_routes import router as admin_router
from app.routes.dashboard_routes import router as dashboard_router 
from app.routes import auth_routes
from app.routes import contact_routes

# 3. Gestion des imports optionnels (Propriétés)
try:
    from app.routes.properties_routes import router as properties_router
    PROPERTIES_AVAILABLE = True
except ImportError as e:
    print(f" ⚠️ Warning: properties routes not loaded: {e}")
    PROPERTIES_AVAILABLE = False

# 4. Initialisation de l'Application
app = FastAPI(
    title="GateOne API - Orchid Island", 
    version="1.1.0",
    description="Unified Backend for AI Real Estate Services"
)

# 5. Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",                    # dev local
        "https://gateone-deploy.vercel.app",        # production Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. Événements de démarrage
@app.on_event("startup")
async def startup_event() -> None:
    print(" 🚀 Starting GateOne unified API - Clean Production Mode")
    print(" Backend services: READY")

# 7. Enregistrement des Routes
app.include_router(admin_router)
app.include_router(email_router)
app.include_router(leads_router)
app.include_router(blogs_router)
app.include_router(analytics_router)
app.include_router(dashboard_router) 
app.include_router(auth_routes.router)
app.include_router(contact_routes.router)

if PROPERTIES_AVAILABLE:
    app.include_router(properties_router)

# 8. Endpoints de base
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
        "status": "healthy"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)