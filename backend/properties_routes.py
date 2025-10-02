from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
import os

router = APIRouter()

# Configuration MongoDB avec gestion d'erreur
try:
    from pymongo import MongoClient
    from bson import ObjectId
    from datetime import datetime
    
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
    
    MONGO_AVAILABLE = True
except ImportError:
    print("⚠️  Warning: pymongo not available, using mock data")
    MONGO_AVAILABLE = False
    
    def get_db():
        return None

# Données de fallback si MongoDB n'est pas disponible
MOCK_PROPERTIES = [
    {
        "id": 1,
        "title": "Luxury Apartment for Sale in Marrakech",
        "type": "Apartment",
        "price": 3000000,
        "location": "Marrakech",
        "bedrooms": 3,
        "bathrooms": 2,
        "area": 147,
        "status": "For Sale",
        "featured": True,
        "description": "Luxury apartment with terraces and parking",
        "image": "/images/property-1.jpg",
        "images": ["/images/property-1.jpg"],
        "features": ["Terrace", "Parking", "Modern finishes"],
        "yearBuilt": 2020,
        "garage": 1,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
]

MOCK_ARTICLES = [
    {
        "id": 1,
        "title": "Guide d'investissement immobilier au Maroc",
        "content": "Article sur l'investissement immobilier...",
        "excerpt": "Découvrez les meilleures opportunités d'investissement",
        "image": "/images/article-1.jpg",
        "category": "Investment",
        "tags": ["investment", "morocco"],
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
]

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
        if not MONGO_AVAILABLE:
            return MOCK_PROPERTIES
            
        db = get_db()
        if not db:
            return MOCK_PROPERTIES
            
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
        print(f"Error fetching properties: {e}")
        return MOCK_PROPERTIES

@router.get("/api/properties/{property_id}")
async def get_property(property_id: int) -> Dict[str, Any]:
    """Récupérer une propriété par son ID"""
    try:
        if not MONGO_AVAILABLE:
            # Chercher dans les données mock
            for prop in MOCK_PROPERTIES:
                if prop["id"] == property_id:
                    return prop
            raise HTTPException(status_code=404, detail="Propriété non trouvée")
            
        db = get_db()
        if not db:
            for prop in MOCK_PROPERTIES:
                if prop["id"] == property_id:
                    return prop
            raise HTTPException(status_code=404, detail="Propriété non trouvée")
            
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
        print(f"Error fetching property {property_id}: {e}")
        # Fallback aux données mock
        for prop in MOCK_PROPERTIES:
            if prop["id"] == property_id:
                return prop
        raise HTTPException(status_code=404, detail="Propriété non trouvée")

@router.get("/api/articles")
async def get_articles() -> List[Dict[str, Any]]:
    """Récupérer tous les articles"""
    try:
        if not MONGO_AVAILABLE:
            return MOCK_ARTICLES
            
        db = get_db()
        if not db:
            return MOCK_ARTICLES
            
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
        print(f"Error fetching articles: {e}")
        return MOCK_ARTICLES

@router.get("/api/articles/{article_id}")
async def get_article(article_id: int) -> Dict[str, Any]:
    """Récupérer un article par son ID"""
    try:
        if not MONGO_AVAILABLE:
            for article in MOCK_ARTICLES:
                if article["id"] == article_id:
                    return article
            raise HTTPException(status_code=404, detail="Article non trouvé")
            
        db = get_db()
        if not db:
            for article in MOCK_ARTICLES:
                if article["id"] == article_id:
                    return article
            raise HTTPException(status_code=404, detail="Article non trouvé")
            
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
        print(f"Error fetching article {article_id}: {e}")
        for article in MOCK_ARTICLES:
            if article["id"] == article_id:
                return article
        raise HTTPException(status_code=404, detail="Article non trouvé")
