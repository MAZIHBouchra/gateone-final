from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
import io
from PIL import Image, ImageDraw, ImageFont
from routers import articles
from routers.Properties import router as properties_router
from routers import admin_simple as admin
from routers import upload
from config import ALLOWED_ORIGINS, HOST, PORT

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes API
app.include_router(articles.router, prefix="/api")
# Les routes ont déjà le préfixe /api dans Properties.py
app.include_router(properties_router)
# Routes Admin
app.include_router(admin.router)
# Routes Upload
app.include_router(upload.router, prefix="/api")

# Admin routes will be added here

# Fichiers statiques (images)
app.mount("/images", StaticFiles(directory="static/images"), name="images")


@app.get("/")
def read_root():
    return {"message": "Real Estate API", "version": "1.0.0", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}


@app.get("/api/placeholder/{width}/{height}")
def generate_placeholder(width: int, height: int):
    """Génère une image placeholder"""
    try:
        # Créer une image avec PIL
        img = Image.new('RGB', (width, height), color='#f3f4f6')
        draw = ImageDraw.Draw(img)

        # Texte à afficher
        text = f"{width}x{height}"

        # Essayer d'utiliser une police par défaut
        try:
            font = ImageFont.truetype(
                "arial.ttf", size=min(width, height) // 10)
        except:
            font = ImageFont.load_default()

        # Calculer la position du texte pour le centrer
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        x = (width - text_width) // 2
        y = (height - text_height) // 2

        # Dessiner le texte
        draw.text((x, y), text, fill='#9ca3af', font=font)

        # Sauvegarder l'image en mémoire
        img_io = io.BytesIO()
        img.save(img_io, 'JPEG', quality=85)
        img_io.seek(0)

        return Response(content=img_io.getvalue(), media_type="image/jpeg")

    except Exception as e:
        # En cas d'erreur, retourner une réponse simple
        return Response(content=b"", media_type="image/jpeg")


@app.get("/images/{filename}")
def serve_image_placeholder(filename: str):
    """Sert des images placeholder pour les images manquantes"""
    # Extraire les dimensions du nom de fichier ou utiliser des valeurs par défaut
    if "article" in filename:
        width, height = 800, 400
    elif "property" in filename:
        width, height = 600, 400
    else:
        width, height = 400, 300

    return generate_placeholder(width, height)


if __name__ == "__main__":
    import uvicorn, os
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))