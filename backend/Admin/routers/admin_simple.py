from fastapi import APIRouter, HTTPException, Form, Request, Depends
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from pymongo import MongoClient
from datetime import datetime
import json
from bson import ObjectId

router = APIRouter()

# Identifiants admin
ADMIN_EMAIL = "GetOne@gmail.com"
ADMIN_PASSWORD = "GetOne2025"


def verify_admin(email: str, password: str) -> bool:
    """Vérifier les identifiants admin"""
    return email == ADMIN_EMAIL and password == ADMIN_PASSWORD

# Page de login admin simple


@router.get("/adminlogin", response_class=HTMLResponse)
async def admin_login_page():
    """Afficher la page de login admin"""
    html_content = """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - GateOne Estate</title>
        <style>
            :root {
                --bg: #f7f3ee;            /* beige clair */
                --panel: #ffffff;         /* blanc */
                --border: #e8e2d9;        /* beige pâle pour bordures */
                --text: #3d352f;          /* brun doux pour titres */
                --muted: #6b6157;         /* texte secondaire */
                --accent: #c7a987;        /* beige soutenu */
                --accent-hover: #b9977f;  /* hover plus foncé */
                --shadow: 0 12px 30px rgba(61, 53, 47, 0.08);
            }
            * { box-sizing: border-box; }
            body {
                font-family: Arial, sans-serif;
                background: var(--bg);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                color: var(--text);
            }
            .login-container {
                background: var(--panel);
                padding: 40px;
                border-radius: 12px;
                border: 1px solid var(--border);
                box-shadow: var(--shadow);
                width: 100%;
                max-width: 420px;
            }
            .logo h1 {
                color: var(--text);
                text-align: center;
                margin-bottom: 8px;
                letter-spacing: 0.3px;
            }
            .logo p {
                margin: 0 0 24px;
                text-align: center;
                color: var(--muted);
                font-size: 14px;
            }
            .form-group { margin-bottom: 18px; }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: var(--muted);
                font-weight: 600;
                font-size: 13px;
            }
            .form-group input {
                width: 100%;
                padding: 12px 14px;
                border: 1px solid var(--border);
                background: #fff;
                border-radius: 8px;
                font-size: 15px;
                color: var(--text);
                outline: none;
                transition: border-color .2s ease, box-shadow .2s ease;
            }
            .form-group input:focus {
                border-color: var(--accent);
                box-shadow: 0 0 0 4px rgba(199, 169, 135, 0.15);
            }
            .login-btn {
                width: 100%;
                padding: 12px 14px;
                background: var(--accent);
                color: #fff;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
                transition: background .2s ease, transform .02s ease;
            }
            .login-btn:hover { background: var(--accent-hover); }
            .login-btn:active { transform: translateY(1px); }
            .credentials-hint {
                background: #fcfaf7;
                border: 1px solid var(--border);
                padding: 14px;
                border-radius: 8px;
                margin-top: 18px;
                font-size: 12px;
                color: var(--muted);
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="logo">
                <h1>GateOne Estate Admin</h1>
                <p>Veuillez vous connecter pour continuer</p>
            </div>
            
    <form method="post" action="/adminlogin" autocomplete="on">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required autocomplete="email">
                </div>
                
                <div class="form-group">
                    <label for="password">Mot de passe:</label>
                    <input type="password" id="password" name="password" required autocomplete="current-password">
                </div>
                
                <button type="submit" class="login-btn">Se connecter</button>
            </form>
            
            <div class="credentials-hint">
                <strong>Identifiants de test:</strong><br>
                Email: GetOne@gmail.com<br>
                Mot de passe: GetOne2025
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

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
        response.set_cookie(
            key="admin_session",
            value="authenticated",
            httponly=True,
            path="/",
            samesite="lax"
        )
        return response
    else:
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

# JSON login/logout for SPA


@router.post("/api/admin/login")
async def admin_login_json(payload: dict):
    email = payload.get("email", "")
    password = payload.get("password", "")
    if verify_admin(email, password):
        response = JSONResponse({"ok": True})
        response.set_cookie(
            key="admin_session",
            value="authenticated",
            httponly=True,
            path="/",
            samesite="lax",
        )
        return response
    raise HTTPException(status_code=401, detail="Identifiants incorrects")


@router.post("/api/admin/logout")
async def admin_logout_json():
    response = JSONResponse({"ok": True})
    response.delete_cookie(key="admin_session", path="/")
    return response

# Dashboard simple


@router.get("/admin/dashboard", response_class=HTMLResponse)
async def admin_dashboard():
    """Dashboard simple"""
    html_content = """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Dashboard Admin</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .card { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>Dashboard Admin - GateOne Estate</h1>
        <div class="card">
            <h3>Bienvenue dans l'administration</h3>
            <p>Système d'administration fonctionnel !</p>
            <p>Prochaines étapes : Ajouter la gestion des articles et propriétés.</p>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

from config import MONGO_URI, DATABASE_NAME

def get_db():
    """Connexion à MongoDB Atlas"""
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    return db


def require_admin(request: Request):
    """Dépendance FastAPI: vérifie le cookie d'auth admin"""
    if request.cookies.get("admin_session") == "authenticated":
        return True
    raise HTTPException(status_code=401, detail="Accès non autorisé")


def serialize_mongo_document(doc: dict) -> dict:
    """Convertit ObjectId et datetime pour JSON."""
    if not doc:
        return doc
    result = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        else:
            result[k] = v
    return result

# Routes pour les articles


@router.post("/admin/articles/add")
async def admin_add_article(
    title: str = Form(...),
    content: str = Form(...),
    excerpt: str = Form(...),
    image: str = Form(...),
    category: str = Form(...),
    tags: str = Form(...)
):
    """Ajouter un nouvel article"""
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# JSON endpoint to add article (SPA-friendly, no redirects)


@router.post("/api/admin/articles")
async def api_admin_add_article(
    request: Request,
    auth: bool = Depends(require_admin)
):
    try:
        payload = await request.json()
        title = payload.get("title", "").strip()
        content = payload.get("content", "").strip()
        excerpt = payload.get("excerpt", "").strip()
        image = payload.get("image", "").strip()
        category = payload.get("category", "").strip()
        tags_str = payload.get("tags", "")

        if not title or not content or not excerpt or not image or not category:
            raise HTTPException(status_code=400, detail="Champs requis manquants")

        db = get_db()

        last_article = db.articles.find_one(sort=[("id", -1)])
        new_id = (last_article["id"] + 1) if last_article else 1

        article = {
            "id": new_id,
            "title": title,
            "content": content,
            "excerpt": excerpt,
            "image": image,
            "category": category,
            "tags": [t.strip() for t in tags_str.split(",") if t.strip()],
            "date": datetime.now().strftime("%Y-%m-%d"),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        # Optional SEO fields
        optional_fields = [
            "seoTitle", "metaDescription", "slug", "focusKeyword", "imageAlt",
            "canonicalUrl", "ogTitle", "ogDescription", "twitterTitle", "twitterDescription",
            "status", "person", "author"
        ]
        for f in optional_fields:
            if f in payload and payload.get(f) is not None:
                article[f] = payload.get(f)

        db.articles.insert_one(article)
        return JSONResponse({"success": True, "id": new_id})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/api/admin/articles/{article_id}")
async def api_admin_update_article(
    article_id: int,
    request: Request,
    auth: bool = Depends(require_admin)
):
    try:
        payload = await request.json()

        update_fields = {}
        updatable = [
            "title", "content", "excerpt", "image", "category", "tags",
            "seoTitle", "metaDescription", "slug", "focusKeyword", "imageAlt",
            "canonicalUrl", "ogTitle", "ogDescription", "twitterTitle", "twitterDescription",
            "status", "person", "author"
        ]
        for key in updatable:
            if key in payload and payload.get(key) is not None:
                if key == "tags" and isinstance(payload.get(key), str):
                    update_fields[key] = [t.strip() for t in payload.get(key).split(",") if t.strip()]
                else:
                    update_fields[key] = payload.get(key)

        if not update_fields:
            raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")

        update_fields["updated_at"] = datetime.now()

        db = get_db()
        result = db.articles.update_one({"id": article_id}, {"$set": update_fields})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Article non trouvé")

        updated = db.articles.find_one({"id": article_id})
        return JSONResponse({"success": True, "article": serialize_mongo_document(updated)})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/articles/delete/{article_id}")
async def admin_delete_article(article_id: int):
    """Supprimer un article"""
    try:
        db = get_db()
        result = db.articles.delete_one({"id": article_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Article non trouvé")

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/articles/edit/{article_id}")
async def admin_edit_article(
    article_id: int,
    title: str = Form(...),
    content: str = Form(...),
    excerpt: str = Form(...),
    image: str = Form(...),
    category: str = Form(...),
    tags: str = Form(...)
):
    """Modifier un article"""
    try:
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

        result = db.articles.update_one(
            {"id": article_id}, {"$set": update_data})

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Article non trouvé")

        return RedirectResponse(url="/admin/articles", status_code=302)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Routes pour les propriétés


@router.post("/admin/properties/add")
async def admin_add_property(
    title: str = Form(...),
    type: str = Form(...),
    price: str = Form(...),
    location: str = Form(...),
    bedrooms: str = Form(...),
    bathrooms: str = Form(...),
    area: str = Form(...),
    status: str = Form(...),
    featured: str = Form(...),
    description: str = Form(...),
    image: str = Form(...),
    images: str = Form(...),
    features: str = Form(...),
    yearBuilt: str = Form(...),
    garage: str = Form(...)
):
    """Ajouter une nouvelle propriété"""
    try:
        db = get_db()

        # Générer un nouvel ID
        last_property = db.properties.find_one(sort=[("id", -1)])
        new_id = (last_property["id"] + 1) if last_property else 1

        # Créer la propriété
        property_data = {
            "id": new_id,
            "title": title,
            "type": type,
            "price": int(price),
            "location": location,
            "bedrooms": int(bedrooms),
            "bathrooms": int(bathrooms),
            "area": int(area),
            "status": status,
            "featured": featured.lower() == 'true',
            "description": description,
            "image": image,
            "images": json.loads(images) if images else [],
            "features": json.loads(features) if features else [],
            "yearBuilt": int(yearBuilt) if yearBuilt else None,
            "garage": int(garage) if garage else None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        db.properties.insert_one(property_data)
        return RedirectResponse(url="/admin/properties", status_code=302)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# JSON endpoint to add property (SPA-friendly)


@router.post("/api/admin/properties")
async def api_admin_add_property(
    request: Request,
    auth: bool = Depends(require_admin)
):
    try:
        payload = await request.json()

        required = [
            "title", "type", "price", "location", "bedrooms", "bathrooms",
            "area", "status", "description"
        ]
        for f in required:
            if payload.get(f) in (None, ""):
                raise HTTPException(status_code=400, detail=f"Champ requis manquant: {f}")

        db = get_db()

        last_property = db.properties.find_one(sort=[("id", -1)])
        new_id = (last_property["id"] + 1) if last_property else 1

        images = payload.get("images") or []
        if isinstance(images, str):
            try:
                images = json.loads(images)
            except Exception:
                images = []
        features = payload.get("features") or []
        if isinstance(features, str):
            try:
                features = json.loads(features)
            except Exception:
                features = []

        property_data = {
            "id": new_id,
            "title": str(payload.get("title")),
            "type": str(payload.get("type")),
            "price": int(payload.get("price")),
            "location": str(payload.get("location")),
            "bedrooms": int(payload.get("bedrooms")),
            "bathrooms": int(payload.get("bathrooms")),
            "area": int(payload.get("area")),
            "status": str(payload.get("status")),
            "featured": bool(payload.get("featured", False)),
            "description": str(payload.get("description")),
            "image": payload.get("image") or (images[0] if images else ""),
            "images": images,
            "features": features,
            "yearBuilt": int(payload.get("yearBuilt")) if payload.get("yearBuilt") not in (None, "") else None,
            "garage": int(payload.get("garage")) if payload.get("garage") not in (None, "") else None,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        db.properties.insert_one(property_data)
        return JSONResponse({"success": True, "id": new_id})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/properties/delete/{property_id}")
async def admin_delete_property(property_id: str):
    """Supprimer une propriété"""
    try:
        db = get_db()
        # Accepte un ID numérique ou un ObjectId
        if property_id.isdigit():
            filter_query = {"id": int(property_id)}
        else:
            if not ObjectId.is_valid(property_id):
                raise HTTPException(status_code=400, detail="ID de propriété invalide")
            filter_query = {"_id": ObjectId(property_id)}

        result = db.properties.delete_one(filter_query)

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404, detail="Propriété non trouvée")

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/properties/edit/{property_id}")
async def admin_edit_property(
    property_id: str,
    title: str = Form(...),
    type: str = Form(...),
    price: str = Form(...),
    location: str = Form(...),
    bedrooms: str = Form(...),
    bathrooms: str = Form(...),
    area: str = Form(...),
    status: str = Form(...),
    featured: str = Form(...),
    description: str = Form(...),
    image: str = Form(...),
    images: str = Form(...),
    features: str = Form(...),
    yearBuilt: str = Form(...),
    garage: str = Form(...)
):
    """Modifier une propriété"""
    try:
        db = get_db()

        update_data = {
            "title": title,
            "type": type,
            "price": int(price),
            "location": location,
            "bedrooms": int(bedrooms),
            "bathrooms": int(bathrooms),
            "area": int(area),
            "status": status,
            "featured": featured.lower() == 'true',
            "description": description,
            "image": image,
            "images": json.loads(images) if images else [],
            "features": json.loads(features) if features else [],
            "yearBuilt": int(yearBuilt) if yearBuilt else None,
            "garage": int(garage) if garage else None,
            "updated_at": datetime.now()
        }

        # Construire le filtre selon le type d'ID
        if property_id.isdigit():
            filter_query = {"id": int(property_id)}
        else:
            if not ObjectId.is_valid(property_id):
                raise HTTPException(status_code=400, detail="ID de propriété invalide")
            filter_query = {"_id": ObjectId(property_id)}

        result = db.properties.update_one(
            filter_query, {"$set": update_data})

        if result.matched_count == 0:
            raise HTTPException(
                status_code=404, detail="Propriété non trouvée")

        return RedirectResponse(url="/admin/properties", status_code=302)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Pages de redirection pour l'administration


@router.get("/admin/articles", response_class=HTMLResponse)
async def admin_articles_page():
    """Page de redirection après ajout d'article"""
    html_content = """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Articles - Admin</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb; }
            .btn { display: inline-block; padding: 10px 20px; margin: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>✅ Opération réussie !</h1>
            <div class="success">
                <p>Votre article a été traité avec succès.</p>
            </div>
            <div style="text-align: center;">
                <a href="/admin/dashboard" class="btn">← Dashboard</a>
                <a href="http://localhost:5173/admin/articles" class="btn">→ Interface Admin</a>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@router.get("/admin/properties", response_class=HTMLResponse)
async def admin_properties_page():
    """Page de redirection après ajout de propriété"""
    html_content = """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Propriétés - Admin</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; text-align: center; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb; }
            .btn { display: inline-block; padding: 10px 20px; margin: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>✅ Opération réussie !</h1>
            <div class="success">
                <p>Votre propriété a été traitée avec succès.</p>
            </div>
            <div style="text-align: center;">
                <a href="/admin/dashboard" class="btn">← Dashboard</a>
                <a href="http://localhost:5173/admin/properties" class="btn">→ Interface Admin</a>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# Endpoints JSON Admin (SPA)


@router.get("/api/admin/me")
async def admin_me(request: Request):
    """Retourne l'état de session admin via cookie."""
    is_authenticated = request.cookies.get("admin_session") == "authenticated"
    return {"authenticated": is_authenticated}


@router.get("/api/admin/stats")
async def admin_stats():
    """Statistiques JSON pour le dashboard admin."""
    try:
        db = get_db()
        articles_count = db.articles.count_documents({})
        properties_count = db.properties.count_documents({})
        return {
            "articlesCount": int(articles_count),
            "propertiesCount": int(properties_count),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
