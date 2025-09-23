from fastapi import APIRouter, HTTPException
from bson import ObjectId
from pymongo import MongoClient
from datetime import datetime
from config import MONGO_URI, DATABASE_NAME

router = APIRouter()

# Connexion MongoDB Atlas
client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
articles_collection = db.articles


@router.get("/articles")
def get_articles():
    articles_cursor = articles_collection.find()
    articles_list = list(articles_cursor)

    for article in articles_list:
        article["_id"] = str(article["_id"])  # Convert ObjectId en string

        # Convertir les dates en string ISO
        for key, value in article.items():
            if isinstance(value, datetime):
                article[key] = value.isoformat()

    return articles_list


@router.get("/articles/{article_id}")
def get_article(article_id: str):
    # Essayer d'abord avec l'ID numérique personnalisé
    if article_id.isdigit():
        article = articles_collection.find_one({"id": int(article_id)})
    else:
        # Sinon, essayer avec ObjectId MongoDB
        if not ObjectId.is_valid(article_id):
            raise HTTPException(status_code=400, detail="Invalid article ID")
        article = articles_collection.find_one({"_id": ObjectId(article_id)})

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Convert ObjectId en string
    article["_id"] = str(article["_id"])

    # Convertir les dates en string ISO
    for key, value in article.items():
        if isinstance(value, datetime):
            article[key] = value.isoformat()

    return article
