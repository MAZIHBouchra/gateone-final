# init_db.py
from app.database.connection import engine
from app.database.models import Base

def create_tables():
    print("🚀 Connexion à la nouvelle base Neon...")
    try:
        # Cette commande parcourt tous tes modèles (Property, Agent, etc.) 
        # et crée les tables correspondantes si elles n'existent pas.
        Base.metadata.create_all(bind=engine)
        print("✅ Toutes les tables ont été créées avec succès sur le compte de l'agence !")
    except Exception as e:
        print(f"❌ Erreur lors de la création : {e}")

if __name__ == "__main__":
    create_tables()