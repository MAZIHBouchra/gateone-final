import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration via tes clés .env
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

class MediaService:
    @staticmethod
    async def upload_property_photo(file_bytes, property_title: str):
        try:
            # On crée un nom de fichier propre basé sur le titre
            folder_path = "gateone_properties"
            public_id = f"villa_{property_title.lower().replace(' ', '_')}"
            
            upload_result = cloudinary.uploader.upload(
                file_bytes,
                folder=folder_path,
                public_id=public_id,
                overwrite=True,
                resource_type="image"
            )
            return upload_result.get("secure_url")
        except Exception as e:
            print(f"❌ Cloudinary Error: {str(e)}")
            return None