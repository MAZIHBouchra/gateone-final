import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


MONGO_URI = "mongodb+srv://orchidland55_db_user:wXw52DtrnbrDBk80@cluster0.c7pm1fd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Lister les bases de données pour voir si on est connecté
    print("Connexion en cours...")
    db_names = client.list_database_names()
    print(f"Connexion réussie ! Bases trouvées : {db_names}")

    # Aller dans la base 'real_estate'
    db = client["real_estate"]
    collections = db.list_collection_names()
    
    print("\n--- CONTENU DE LA BASE ---")
    for col_name in collections:
        count = db[col_name].count_documents({})
        print(f"Collection '{col_name}' : {count} documents")

except Exception as e:
    print(f"Erreur de connexion : {e}")
    print("\nNote d'ingénieur : Si l'erreur parle d'IP, c'est que l'adresse IP du bureau n'est pas autorisée sur MongoDB Atlas.")