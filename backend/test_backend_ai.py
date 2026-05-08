import os
import asyncio
from dotenv import load_dotenv
from app.services.ai_service import AIService

# Charger les clés API
load_dotenv()

async def debug_ai_generation():
    print("🚀 Démarrage du test de génération IA...")
    
    ai = AIService()
    
    # On simule des données riches pour donner de la matière à l'IA
    test_data = {
        "title": "Villa Royale de Prestige",
        "intent": "Sale",
        "type": "Luxury Villa",
        "location": "Marrakech",
        "neighborhood": "Palmeraie",
        "price": "15000000",
        "area_sqm": "800",
        "plot_size": "5000",
        "bedrooms": "6",
        "bathrooms": "7",
        "features": "Piscine olympique, marbre rare, hammam traditionnel, domotique, jardin andalou, finitions de luxe."
    }

    print(f"📝 Envoi de la requête à l'IA (Modèle: {ai.llm.model})...")
    
    # On appelle directement la fonction de génération
    # On demande en English comme dans ton code
    content = ai.generate_seo_article(test_data, "English")

    print("\n" + "="*50)
    print("📊 RÉSULTATS DU TEST :")
    print("="*50)
    
    if not content:
        print("❌ ERREUR : L'IA a renvoyé un contenu vide.")
        return

    word_count = len(content.split())
    char_count = len(content)
    
    print(f"✅ Nombre de mots générés : {word_count}")
    print(f"✅ Nombre de caractères : {char_count}")
    
    print("\n--- DÉBUT DU CONTENU ---")
    print(content)
    print("--- FIN DU CONTENU ---")
    
    if content.strip().endswith("€") or content.strip().endswith("$"):
        print("\n⚠️ ALERTE : Le texte semble coupé à la fin (tronqué) !")
    
    if word_count < 800:
        print("\n⚠️ CONSEIL : L'article est trop court. Il faut muscler le prompt ou changer de modèle.")

if __name__ == "__main__":
    asyncio.run(debug_ai_generation())