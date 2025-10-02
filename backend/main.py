from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import sys
from price_routes import price_router
from price_model import PredictorService
try:
    from Admin.routers import admin_simple as admin
except Exception:
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), "Admin"))
        from routers import admin_simple as admin  # type: ignore
    except Exception as e:
        admin = None  # type: ignore
        print(f"⚠️  Warning: admin routes not loaded: {e}")


# Import routers
from chatbot_routes import chatbot_router
from email_routes import email_router
try:
    from properties_routes import router as properties_router
    PROPERTIES_AVAILABLE = True
except Exception as e:
    print(f"⚠️  Warning: properties routes not loaded: {e}")
    properties_router = None
    PROPERTIES_AVAILABLE = False

# Import chatbot module for status
import chatbot_api as ca

# Create FastAPI app
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
    print("🚀 Starting GateOne unified API...")
    light = os.getenv("LIGHT_STARTUP", "0") == "1"
    if light:
        print("⚙️  LIGHT_STARTUP=1 → Skipping heavy initializations")
    else:
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
# Properties routes (optional)
if PROPERTIES_AVAILABLE and properties_router:
    app.include_router(properties_router)
# Admin auth routes (login/logout, me)
if admin:
    app.include_router(admin.router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "GateOne API is running!",
        "services": {
            "chatbot": "/chat",
            "email": "/email",
            "health": "/health",
            "docs": "/docs"
        }
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



