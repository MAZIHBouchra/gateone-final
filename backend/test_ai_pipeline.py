import uuid
from app.database.connection import SessionLocal
from app.services.ai_service import AIService
from app.database.models import Property

async def test_full_ai_workflow():
    db = SessionLocal()
    ai_service = AIService()
    
    # 1. On choisit une propriété déjà existante dans ta base Neon
    # On en récupère une au hasard pour le test
    prop = db.query(Property).first()
    if not prop:
        print(" Erreur : Ajoute au moins un bien via seed_db.py avant !")
        return

    print(f"--- TEST DU FLUX POUR : {prop.title} ---")

    # 2. ÉTAPE D'APERÇU (Simulation du clic 'Générer')
    property_data = {
        "type": prop.type,
        "intent": "Sale",
        "location": prop.location,
        "price": str(prop.price),
        "built_size": f"{prop.area_sqm} m2",
        "bedrooms": prop.bedrooms,
        "bathrooms": 4, # donnée fictive pour le test
        "features": prop.description
    }
    
    print("\n1.  Appel de l'IA pour l'aperçu...")
    preview_content = await ai_service.get_article_preview(property_data, lang="en")
    print(" Aperçu reçu avec succès !")
    print(f"Extrait : {preview_content[:100]}...")

    # 3. ÉTAPE DE VALIDATION (Simulation du clic 'Publier')
    # On imagine que l'agent a ajouté "Very luxury" au début du texte
    final_text_modified_by_agent = "VERY LUXURY! " + preview_content
    
    print("\n2.  Simulation de la validation par l'agent et sauvegarde...")
    ai_service.save_validated_article(
        db=db,
        property_id=prop.id,
        final_content=final_text_modified_by_agent,
        lang="en",
        seo_title=f"Validated Luxury {prop.type} in Marrakech"
    )
    
    print(" Article validé et enregistré dans la table ai_content_cache !")
    db.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_full_ai_workflow())