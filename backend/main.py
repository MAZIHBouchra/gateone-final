from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import sys

# Ajout du chemin racine pour éviter les erreurs d'import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import des routeurs depuis la nouvelle structure
from app.routes.chatbot_routes import chatbot_router
from app.routes.email_routes import email_router
from app.routes.price_routes import price_router

try:
    from app.routes.properties_routes import router as properties_router
    PROPERTIES_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Warning: properties routes not loaded: {e}")
    properties_router = None
    PROPERTIES_AVAILABLE = False

# Import du service chatbot (déplacé dans services)
try:
    from app.services import chatbot_api as ca
except ImportError:
    import chatbot_api as ca # Fallback si pas encore déplacé

app = FastAPI(
    title="GateOne API - Orchid Island", 
    version="1.1.0",
    description="Unified Backend for AI Real Estate Services"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://appealing-smile-production.up.railway.app",
        "https://gateone-deploy-production.up.railway.app",
        "https://gateone.immo"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],

)

# Initialize chatbot on startup
@app.on_event("startup")
async def startup_event() -> None:
    print("🚀 Starting GateOne unified API with Clean Architecture...")
    # Initialisation du RAG (IA)
    success = ca.initialize_rag_system()
    if success:
        print("✅ AI Chatbot Engine: READY")
    else:
        print("❌ AI Chatbot Engine: FAILED")

# Include routers
app.include_router(chatbot_router)
app.include_router(email_router)
app.include_router(price_router)
# Properties routes (optional)
if PROPERTIES_AVAILABLE and properties_router:
    app.include_router(properties_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "online",
        "architecture": "Clean Architecture V1",
        "documentation": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "chatbot": "/chat/status",
            "email": "/email/config"
        },
        "chatbot_initialized": ca.qa_chain is not None
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



