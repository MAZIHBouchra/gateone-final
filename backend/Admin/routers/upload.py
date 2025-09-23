from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from pymongo import MongoClient
from bson import ObjectId
import base64
from datetime import datetime
import uuid

router = APIRouter()

# Connexion MongoDB Atlas (utilise la même config que le reste de l'app)
try:
    from Admin.config import MONGO_URI, DATABASE_NAME
except Exception:
    # Fallback si import relatif selon le cwd
    from config import MONGO_URI, DATABASE_NAME

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
images_collection = db.images

@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload une image et la stocke dans MongoDB"""
    try:
        # Vérifier le type de fichier
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Le fichier doit être une image")
        
        # Lire le contenu du fichier
        content = await file.read()
        
        # Générer un ID unique pour l'image
        image_id = str(uuid.uuid4())
        
        # Encoder l'image en base64 pour le stockage
        image_base64 = base64.b64encode(content).decode('utf-8')
        
        # Créer le document image
        image_doc = {
            "id": image_id,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content),
            "data": image_base64,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        # Insérer dans MongoDB
        result = images_collection.insert_one(image_doc)
        
        if result.inserted_id:
            return {
                "success": True,
                "image_id": image_id,
                "filename": file.filename,
                "url": f"/api/images/{image_id}",
                "size": len(content)
            }
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la sauvegarde")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

@router.get("/images/{image_id}")
async def get_image(image_id: str):
    """Récupère une image depuis MongoDB"""
    try:
        # Chercher l'image dans MongoDB
        image_doc = images_collection.find_one({"id": image_id})
        
        if not image_doc:
            raise HTTPException(status_code=404, detail="Image non trouvée")
        
        # Décoder l'image depuis base64
        image_data = base64.b64decode(image_doc["data"])
        
        # Retourner l'image avec le bon content-type
        return Response(
            content=image_data,
            media_type=image_doc["content_type"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.get("/images")
async def list_images():
    """Liste toutes les images uploadées"""
    try:
        images_cursor = images_collection.find({}, {
            "id": 1,
            "filename": 1,
            "content_type": 1,
            "size": 1,
            "created_at": 1,
            "_id": 0
        })
        
        images_list = list(images_cursor)
        
        # Ajouter l'URL pour chaque image
        for image in images_list:
            image["url"] = f"/api/images/{image['id']}"
            if isinstance(image.get("created_at"), datetime):
                image["created_at"] = image["created_at"].isoformat()
        
        return images_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@router.delete("/images/{image_id}")
async def delete_image(image_id: str):
    """Supprime une image"""
    try:
        result = images_collection.delete_one({"id": image_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Image non trouvée")
        
        return {"success": True, "message": "Image supprimée avec succès"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")
