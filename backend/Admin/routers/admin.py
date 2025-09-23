from fastapi import APIRouter, HTTPException, Depends, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pymongo import MongoClient
from datetime import datetime
from typing import Optional
import os

router = APIRouter()

# Créer le répertoire templates s'il n'existe pas
templates_dir = "templates"
if not os.path.exists(templates_dir):
    os.makedirs(templates_dir)

templates = Jinja2Templates(directory=templates_dir)

from config import MONGO_URI, DATABASE_NAME, ADMIN_EMAIL, ADMIN_PASSWORD

def get_db():
    """Connexion à MongoDB Atlas"""
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    return db


def verify_admin(email: str, password: str) -> bool:
    """Vérifier les identifiants admin"""
    return email == ADMIN_EMAIL and password == ADMIN_PASSWORD

# Page de login admin


@router.get("/adminlogin", response_class=HTMLResponse)
async def admin_login_page(request: Request):
    """Afficher la page de login admin"""
    return templates.TemplateResponse("admin_login.html", {"request": request})

# Traitement du login


@router.post("/adminlogin")
async def admin_login(
    email: str = Form(...),
    password: str = Form(...)
):
    """Traiter la connexion admin"""
    if verify_admin(email, password):
        # Rediriger vers le dashboard admin
        response = RedirectResponse(url="/admin/dashboard", status_code=302)
        response.set_cookie(key="admin_session",
                            value="authenticated", httponly=True)
        return response
    else:
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

# Middleware pour vérifier l'authentification admin


def require_admin_auth(request: Request):
    """Vérifier que l'utilisateur est connecté en tant qu'admin"""
    admin_session = request.cookies.get("admin_session")
    if admin_session != "authenticated":
        raise HTTPException(status_code=401, detail="Accès non autorisé")
    return True

# Dashboard admin


@router.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard(request: Request, auth: bool = Depends(require_admin_auth)):
    """Dashboard principal de l'admin"""
    db = get_db()

    # Compter les articles et propriétés
    articles_count = db.articles.count_documents({})
    properties_count = db.properties.count_documents({})

    return templates.TemplateResponse("admin_dashboard.html", {
        "request": request,
        "articles_count": articles_count,
        "properties_count": properties_count
    })

# Gestion des articles


@router.get("/admin/articles", response_class=HTMLResponse)
async def admin_articles(request: Request, auth: bool = Depends(require_admin_auth)):
    """Liste des articles pour l'admin"""
    db = get_db()
    articles = list(db.articles.find({}))

    return templates.TemplateResponse("admin_articles.html", {
        "request": request,
        "articles": articles
    })


@router.get("/admin/articles/add", response_class=HTMLResponse)
async def admin_add_article_form(request: Request, auth: bool = Depends(require_admin_auth)):
    """Formulaire d'ajout d'article"""
    return templates.TemplateResponse("admin_add_article.html", {"request": request})


@router.post("/admin/articles/add")
async def admin_add_article(
    request: Request,
    auth: bool = Depends(require_admin_auth),
    title: str = Form(...),
    content: str = Form(...),
    excerpt: str = Form(...),
    image: str = Form(...),
    category: str = Form(...),
    tags: str = Form(...)
):
    """Ajouter un nouvel article"""
    db = get_db()

    # Générer un nouvel ID
    last_article = db.articles.find_one(sort=[("id", -1)])
    new_id = (last_article["id"] + 1) if last_article else 1

    # Créer l'article
    article = {
        "id": new_id,
        "title": title,
        "content": content,
        "excerpt": excerpt,
        "image": image,
        "category": category,
        "tags": tags.split(",") if tags else [],
        "date": datetime.now().strftime("%Y-%m-%d"),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

    db.articles.insert_one(article)
    return RedirectResponse(url="/admin/articles", status_code=302)


@router.get("/admin/articles/edit/{article_id}", response_class=HTMLResponse)
async def admin_edit_article_form(
    request: Request,
    article_id: int,
    auth: bool = Depends(require_admin_auth)
):
    """Formulaire de modification d'article"""
    db = get_db()
    article = db.articles.find_one({"id": article_id})

    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")

    return templates.TemplateResponse("admin_edit_article.html", {
        "request": request,
        "article": article
    })


@router.post("/admin/articles/edit/{article_id}")
async def admin_edit_article(
    request: Request,
    article_id: int,
    auth: bool = Depends(require_admin_auth),
    title: str = Form(...),
    content: str = Form(...),
    excerpt: str = Form(...),
    image: str = Form(...),
    category: str = Form(...),
    tags: str = Form(...)
):
    """Modifier un article"""
    db = get_db()

    update_data = {
        "title": title,
        "content": content,
        "excerpt": excerpt,
        "image": image,
        "category": category,
        "tags": tags.split(",") if tags else [],
        "updated_at": datetime.now()
    }

    result = db.articles.update_one({"id": article_id}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")

    return RedirectResponse(url="/admin/articles", status_code=302)


@router.post("/admin/articles/delete/{article_id}")
async def admin_delete_article(
    article_id: int,
    auth: bool = Depends(require_admin_auth)
):
    """Supprimer un article"""
    db = get_db()

    result = db.articles.delete_one({"id": article_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article non trouvé")

    return RedirectResponse(url="/admin/articles", status_code=302)

# Déconnexion admin


@router.post("/admin/logout")
async def admin_logout():
    """Déconnecter l'admin"""
    response = RedirectResponse(url="/adminlogin", status_code=302)
    response.delete_cookie(key="admin_session")
    return response
