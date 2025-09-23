from fastapi import APIRouter, HTTPException
from bson import ObjectId
from pymongo import MongoClient
from datetime import datetime
from typing import Optional
from config import MONGO_URI, DATABASE_NAME

router = APIRouter()

# Connexion MongoDB Atlas
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
properties_collection = db.properties


@router.get("/api/properties")
def get_properties(
    property_type: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[int] = None,
    sort_by: Optional[str] = "newest"
):
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

    properties_cursor = properties_collection.find(
        filter_query).sort(sort_criteria)
    properties_list = list(properties_cursor)

    for property in properties_list:
        property["_id"] = str(property["_id"])  # Convert ObjectId en string
        # Ne pas écraser un id numérique existant; sinon, fournir un id string basé sur _id
        if "id" not in property:
            property["id"] = str(property["_id"])  # compatibilité frontend si pas d'id numérique

        # Convertir les dates en string ISO
        for key, value in property.items():
            if isinstance(value, datetime):
                property[key] = value.isoformat()

    return properties_list


@router.get("/api/properties/{property_id}")
def get_property(property_id: str):
    # Accepter les ID numériques du frontend
    if property_id.isdigit():
        # Chercher par l'ID numérique personnalisé
        property = properties_collection.find_one({"id": int(property_id)})
    else:
        # Chercher par ObjectId MongoDB
        if not ObjectId.is_valid(property_id):
            raise HTTPException(status_code=400, detail="Invalid property ID")
        property = properties_collection.find_one(
            {"_id": ObjectId(property_id)})

    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    # Convert ObjectId en string
    property["_id"] = str(property["_id"])

    # S'assurer que l'ID numérique existe
    if "id" not in property:
        property["id"] = property["_id"]

    # Convertir les dates en string ISO
    for key, value in property.items():
        if isinstance(value, datetime):
            property[key] = value.isoformat()

    return property


@router.post("/api/properties")
def create_property(property_data: dict):
    property_data["created_at"] = datetime.now()
    property_data["updated_at"] = datetime.now()

    result = properties_collection.insert_one(property_data)

    # Récupérer la propriété créée
    new_property = properties_collection.find_one({"_id": result.inserted_id})
    new_property["_id"] = str(new_property["_id"])
    new_property["id"] = str(new_property["_id"])

    # Convertir les dates en string ISO
    for key, value in new_property.items():
        if isinstance(value, datetime):
            new_property[key] = value.isoformat()

    return new_property


@router.put("/api/properties/{property_id}")
def update_property(property_id: str, property_data: dict):
    if property_id.isdigit():
        filter_query = {"id": int(property_id)}
    else:
        if not ObjectId.is_valid(property_id):
            raise HTTPException(status_code=400, detail="Invalid property ID")
        filter_query = {"_id": ObjectId(property_id)}

    property_data["updated_at"] = datetime.now()

    result = properties_collection.update_one(
        filter_query,
        {"$set": property_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")

    # Récupérer la propriété mise à jour
    updated_property = properties_collection.find_one(filter_query)
    updated_property["_id"] = str(updated_property["_id"])

    # Convertir les dates en string ISO
    for key, value in updated_property.items():
        if isinstance(value, datetime):
            updated_property[key] = value.isoformat()

    return updated_property


@router.delete("/api/properties/{property_id}")
def delete_property(property_id: str):
    if property_id.isdigit():
        filter_query = {"id": int(property_id)}
    else:
        if not ObjectId.is_valid(property_id):
            raise HTTPException(status_code=400, detail="Invalid property ID")
        filter_query = {"_id": ObjectId(property_id)}

    result = properties_collection.delete_one(filter_query)

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")

    return {"message": "Property deleted successfully"}
