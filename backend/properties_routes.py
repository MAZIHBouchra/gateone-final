from fastapi import APIRouter, HTTPException, status
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

# Charger les variables d'environnement (Sécurité Phase 1)
load_dotenv()

router = APIRouter()

# --- CONFIGURATION MONGODB SÉCURISÉE ---
try:
    from pymongo import MongoClient
    from bson import ObjectId
    from datetime import datetime
    
    # Récupération sécurisée via variables d'environnement uniquement
    MONGO_URI = os.getenv("MONGO_URI")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "real_estate")
    
    def get_db():
        """Connexion à MongoDB Atlas via variables d'environnement"""
        if not MONGO_URI:
            return None
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            return client[DATABASE_NAME]
        except Exception:
            return None
    
    MONGO_AVAILABLE = True
except ImportError:
    print("⚠️  Warning: pymongo not available. Database features will be disabled.")
    MONGO_AVAILABLE = False
    def get_db(): return None


# --- ROUTES API : PROPRIÉTÉS ---

@router.get("/api/properties", response_model=List[Dict[str, Any]])
async def get_properties(
    property_type: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    sort_by: Optional[str] = "newest"
) -> List[Dict[str, Any]]:
    """Récupérer toutes les propriétés réelles (Retourne [] si vide ou erreur)"""
    try:
        db = get_db()
        if not db or not MONGO_AVAILABLE:
            return [] # Plus de Mock Data ici
            
        properties_collection = db.properties
        
        # Construction dynamique du filtre
        filter_query = {}
        if property_type and property_type != "all":
            filter_query["type"] = {"$regex": property_type, "$options": "i"}
        if location:
            filter_query["location"] = {"$regex": location, "$options": "i"}
        if min_price:
            filter_query["price"] = {"$gte": min_price}
        if max_price:
            if "price" in filter_query:
                filter_query["price"]["$lte"] = max_price
            else:
                filter_query["price"] = {"$lte": max_price}
        if bedrooms:
            filter_query["bedrooms"] = {"$gte": bedrooms}
        if bathrooms:
            filter_query["bathrooms"] = {"$gte": bathrooms}

        # Logique de tri
        sort_options = {
            "newest": [("created_at", -1)],
            "oldest": [("created_at", 1)],
            "price-low": [("price", 1)],
            "price-high": [("price", -1)],
            "area-large": [("area", -1)],
            "area-small": [("area", 1)],
        }
        sort_criteria = sort_options.get(sort_by, [("created_at", -1)])

        # Exécution de la requête
        properties_cursor = properties_collection.find(filter_query).sort(sort_criteria)
        properties_list = list(properties_cursor)

        # Nettoyage des données pour le JSON
        for prop in properties_list:
            prop["_id"] = str(prop["_id"])
            if "id" not in prop:
                prop["id"] = 0 # Valeur par défaut sécurisée

        return properties_list
        
    except Exception as e:
        print(f"Database Error: {e}")
        return []

@router.get("/api/properties/{property_id}")
async def get_property(property_id: int) -> Dict[str, Any]:
    """Récupérer une propriété spécifique par son ID numérique"""
    db = get_db()
    if not db or not MONGO_AVAILABLE:
        raise HTTPException(status_code=503, detail="Service de base de données indisponible")
        
    try:
        property_data = db.properties.find_one({"id": property_id})
        if not property_data:
            raise HTTPException(status_code=404, detail="Propriété non trouvée")
            
        property_data["_id"] = str(property_data["_id"])
        return property_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")


# --- ROUTES API : ARTICLES DE BLOG ---

@router.get("/api/articles", response_model=List[Dict[str, Any]])
async def get_articles() -> List[Dict[str, Any]]:
    """Récupérer la liste des articles (Retourne [] si vide)"""
    try:
        db = get_db()
        if not db or not MONGO_AVAILABLE:
            return []
            
        articles_cursor = db.articles.find().sort("created_at", -1)
        articles_list = list(articles_cursor)
        
        for article in articles_list:
            article["_id"] = str(article["_id"])
                
        return articles_list
    except Exception:
        return []

@router.get("/api/articles/{article_id}")
async def get_article(article_id: int) -> Dict[str, Any]:
    """Récupérer un article spécifique"""
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Base de données déconnectée")
        
    article = db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
        
    article["_id"] = str(article["_id"])
    return article