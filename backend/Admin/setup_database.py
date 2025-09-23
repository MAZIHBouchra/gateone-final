#!/usr/bin/env python3
"""
Script pour initialiser la base de données avec des données de test
"""

from insert_articles_new import insert_articles
from insert_properties_new import insert_properties
from pymongo import MongoClient
from config import MONGO_URI

def check_mongodb_connection():
    """Vérifier la connexion à MongoDB Atlas"""
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')  # Vérifier que le serveur répond
        print("✅ Connexion à MongoDB Atlas réussie!")
        return True
    except Exception as e:
        print(f"❌ Erreur de connexion à MongoDB Atlas: {e}")
        print("\n💡 Solutions possibles:")
        print("1. Vérifiez que vos identifiants Atlas sont corrects.")
        print("2. Assurez-vous que votre IP est autorisée dans le réseau Atlas (IP Whitelist).")
        print("3. Vérifiez que votre cluster Atlas est en ligne.")
        return False


def main():
    """Fonction principale"""
    print("🚀 Initialisation de la base de données sur MongoDB Atlas...")
    print("=" * 50)
    
    if not check_mongodb_connection():
        return
    
    try:
        # Insérer les articles
        print("\n📰 Insertion des articles...")
        insert_articles()
        
        # Insérer les propriétés
        print("\n🏠 Insertion des propriétés...")
        insert_properties()
        
        print("\n" + "=" * 50)
        print("🎉 Base de données initialisée avec succès sur Atlas!")
        print("\n📊 Données ajoutées:")
        print("- 7 articles de blog")
        print("- 8 propriétés immobilières")
        print("\n🔗 Vous pouvez maintenant:")
        print("1. Démarrer votre backend: uvicorn main:app --reload")
        print("2. Tester votre système d'administration: http://localhost:5173/adminlogin")
        print("3. Identifiants: GetOne@gmail.com / GetOne2025")
        
    except Exception as e:
        print(f"\n❌ Erreur lors de l'insertion des données: {e}")
        print("Vérifiez votre connexion à MongoDB Atlas et vos identifiants.")


if __name__ == "__main__":
    main()
