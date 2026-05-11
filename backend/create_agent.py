# create_agent.py
from app.database.connection import SessionLocal
from app.database.models import Agent
from app.services.auth_service import AuthService

def create_test_agent():
    db = SessionLocal()
    # Vérifie si l'agent existe déjà
    existing = db.query(Agent).filter(Agent.email == "bouchra@gateone.immo").first()
    if not existing:
        new_agent = Agent(
            first_name="Bouchra",
            last_name="Admin",
            email="bouchra@gateone.immo",
            hashed_password=AuthService.get_password_hash("Luxury2024"), # Ton mot de passe
            role="admin"
        )
        db.add(new_agent)
        db.commit()
        print("✅ Agent créé avec succès !")
    else:
        print("ℹ️ L'agent existe déjà.")
    db.close()

if __name__ == "__main__":
    create_test_agent()