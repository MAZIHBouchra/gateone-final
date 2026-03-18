from database.connection import engine, Base
# Importer tous les modèles pour que SQLAlchemy les connaisse
from database.models import Agent, Property, PropertyMedia, DocumentIntelligence, MarketIntelligence, Lead, UserInteraction, AIContentCache

def create_database():
    print("Initialisation de la base de données PostgreSQL...")
    try:
        # Cette ligne crée toutes les tables dans PostgreSQL
        Base.metadata.create_all(bind=engine)
        print("Architecture de données créée avec succès !")
    except Exception as e:
        print(f"Erreur lors de la création : {e}")

if __name__ == "__main__":
    create_database()