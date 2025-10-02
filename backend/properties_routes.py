from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
import os
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

router = APIRouter()

# Configuration MongoDB
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://orchidland55_db_user:wXw52DtrnbrDBk80@cluster0.c7pm1fd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
DATABASE_NAME = os.getenv("DATABASE_NAME", "real_estate")

def get_db():
    """Connexion à MongoDB Atlas"""
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    return db

@router.get("/api/properties")
async def get_properties(
    property_type: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    sort_by: Optional[str] = "newest"
) -> List[Dict[str, Any]]:
    """Récupérer toutes les propriétés avec filtres optionnels"""
    try:
        db = get_db()
        properties_collection = db.properties
        
        # Construction du filtre de recherche
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

        # Tri
        sort_options = {
            "newest": [("created_at", -1)],
            "oldest": [("created_at", 1)],
            "price-low": [("price", 1)],
            "price-high": [("price", -1)],
            "area-large": [("area", -1)],
            "area-small": [("area", 1)],
        }
        sort_criteria = sort_options.get(sort_by, [("created_at", -1)])

        properties_cursor = properties_collection.find(filter_query).sort(sort_criteria)
        properties_list = list(properties_cursor)

        # Convertir ObjectId en string et ajouter l'ID numérique
        for property in properties_list:
            property["_id"] = str(property["_id"])
            # S'assurer que l'ID numérique existe
            if "id" not in property:
                property["id"] = property.get("id", 1)

        return properties_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des propriétés: {str(e)}")

@router.get("/api/properties/{property_id}")
async def get_property(property_id: int) -> Dict[str, Any]:
    """Récupérer une propriété par son ID"""
    try:
        db = get_db()
        properties_collection = db.properties
        
        # Chercher par ID numérique
        property = properties_collection.find_one({"id": property_id})
        
        if not property:
            raise HTTPException(status_code=404, detail="Propriété non trouvée")
            
        # Convertir ObjectId en string
        property["_id"] = str(property["_id"])
        
        return property
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de la propriété: {str(e)}")

@router.get("/api/articles")
async def get_articles() -> List[Dict[str, Any]]:
    """Récupérer tous les articles"""
    try:
        db = get_db()
        articles_collection = db.articles
        
        articles_cursor = articles_collection.find().sort("created_at", -1)
        articles_list = list(articles_cursor)
        
        # Convertir ObjectId en string
        for article in articles_list:
            article["_id"] = str(article["_id"])
            # S'assurer que l'ID numérique existe
            if "id" not in article:
                article["id"] = article.get("id", 1)
                
        return articles_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des articles: {str(e)}")

@router.get("/api/articles/{article_id}")
async def get_article(article_id: int) -> Dict[str, Any]:
    """Récupérer un article par son ID"""
    try:
        db = get_db()
        articles_collection = db.articles
        
        # Chercher par ID numérique
        article = articles_collection.find_one({"id": article_id})
        
        if not article:
            raise HTTPException(status_code=404, detail="Article non trouvé")
            
        # Convertir ObjectId en string
        article["_id"] = str(article["_id"])
        
        return article
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de l'article: {str(e)}")
