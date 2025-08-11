from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import routers
from chatbot_routes import chatbot_router
from email_routes import email_router

# Import chatbot init and state for health
from chatbot_api import initialize_rag_system, qa_chain

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
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:8081"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize chatbot on startup
@app.on_event("startup")
async def startup_event() -> None:
    print("🚀 Starting GateOne unified API...")
    success = initialize_rag_system()
    if success:
        print("✅ Chatbot initialized successfully!")
        print("🌐 Server ready to accept connections")
    else:
        print("❌ Failed to initialize chatbot! Check data file and API keys.")

# Include routers
app.include_router(chatbot_router)
app.include_router(email_router)

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
        "chatbot_initialized": qa_chain is not None
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
