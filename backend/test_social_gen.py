import asyncio
import os
from app.services.ai_service import AIService

async def test_social_distribution():
    # 1. Initialisation du service
    ai_service = AIService()
    
    # 2. Données de test (Villa Jade que le marketing aime bien)
    test_data = {
        "intent": "Sale",
        "title": "Villa Jade Targa",
        "type": "Luxury Villa",
        "location": "Targa, Marrakech",
        "price": "7,500,000 MAD",
        "built_size": "450 m2",
        "bedrooms": 5,
        "bathrooms": 4,
        "features": "Italian marble, solar panels, 12m overflow pool, 800m2 garden"
    }

    print("🚀 ÉTAPE 1 : Génération de l'article expert...")
    article = ai_service.generate_seo_article(test_data, "English")
    print("✅ Article généré avec succès.")

    print("\n📱 ÉTAPE 2 : Génération du Pack Réseaux Sociaux...")
    # On appelle ta nouvelle fonction
    social_pack = await ai_service.generate_social_media_pack(article, test_data)
    
    print("\n--- RÉSULTAT DU PACK RÉSEAUX SOCIAUX ---")
    print(social_pack)

if __name__ == "__main__":
    asyncio.run(test_social_distribution())