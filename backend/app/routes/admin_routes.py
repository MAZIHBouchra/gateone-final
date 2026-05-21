from fastapi import APIRouter, HTTPException, Form, Request, Depends
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
import os

# Tes nouveaux imports d'ingénieure
from app.database.connection import get_db
from app.database.models import Agent # On imagine que l'admin est un Agent

router = APIRouter(prefix="/api/admin", tags=["admin"])

# On récupère les secrets du .env
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

@router.post("/login")
async def admin_login(
    email: str = Form(...),
    password: str = Form(...)
):
    # Logique de vérification (Backend side)
    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        response = JSONResponse({"ok": True})
        response.set_cookie(
            key="admin_session",
            value="authenticated",
            httponly=True,
            samesite="none",
            secure=True
        )
        return response
    else:
        raise HTTPException(status_code=401, detail="Identifiants incorrects")