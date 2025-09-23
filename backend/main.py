from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
from price_routes import price_router
from price_model import PredictorService
from Admin.routers import admin_simple as admin

from chatbot_routes import chatbot_router
from email_routes import email_router
import chatbot_api as ca

app = FastAPI(
    title="GateOne API",
    version="1.0.0",
    description="Unified API for GateOne Estate - Chatbot and Email Services"
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
        "https://gateone.immo"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event() -> None:
    print("🚀 Starting GateOne unified API...")
    success = ca.initialize_rag_system()
    if success:
        print("✅ Chatbot initialized successfully!")
        print("🌐 Server ready to accept connections")
    else:
        print("❌ Failed to initialize chatbot! Check data file and API keys.")
    svc = PredictorService.instance()
    if svc.load():
        print(f"✅ Price model loaded from: {svc.model_path}")
    else:
        print(f"❌ Price model failed to load from: {svc.model_path}")

# Include routers
app.include_router(chatbot_router)
app.include_router(email_router)
app.include_router(price_router)
app.include_router(admin.router)  # admin routes avec /api/admin

@app.get("/")
async def root():
    return {
        "message": "GateOne API is running!",
        "services": {
            "chatbot": "/chat",
            "email": "/email",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "chatbot": "/chat/status",
            "email": "/email/config"
        },
        "chatbot_initialized": ca.qa_chain is not None
    }

if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=PORT)
