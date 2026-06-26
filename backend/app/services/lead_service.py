from sqlalchemy.orm import Session
from app.database.models import Lead, UserInteraction, LeadStatus, ActionCategory

class LeadIntelligenceService:
    # 1. Poids des actions (Tableau 4.1 du rapport)
    WEIGHTS = {
        ActionCategory.click_whatsapp: 30,
        ActionCategory.download_pdf: 20,
        ActionCategory.chatbot_query: 15,
        ActionCategory.view_property: 5,
        ActionCategory.view_listing: 2
    }

    @staticmethod
    def calculate_financial_score(budget_tier: str) -> int:
        """
        Calcule S_financial (Tableau 4.2 du rapport).
        Passé au moment de l'inscription (Sign Up).
        """
        mapping = {
            "VIP": 50,      # > 10M
            "PREMIUM": 30,  # > 5M
            "STANDARD": 15, # > 1M
            "ENTRY": 5      # < 1M
        }
        return mapping.get(budget_tier, 0)

    @classmethod
    async def log_interaction(cls, db: Session, lead_id: str, action: ActionCategory):
        """
        Met à jour S_behavioral et S_total.
        Logic : S_behavioral = min(sum(wi), 50)
        """
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead: return

        # 1. On calcule le nouveau score comportemental
        weight = cls.WEIGHTS.get(action, 0)
        new_behavioral = lead.behavioral_points + weight
        lead.behavioral_points = min(new_behavioral, 50) # Cap à 50 (Formule du rapport)

        # 2. Mise à jour du Score Total
        lead.ai_score = float(lead.behavioral_points + lead.financial_points)

        # 3. Automatisation du Statut (Regle d'automation du rapport)
        if lead.ai_score >= 80:
            lead.current_status = LeadStatus.qualified
        elif 40 <= lead.ai_score < 80 and lead.current_status == LeadStatus.new:
            lead.current_status = LeadStatus.viewing

        db.commit()
        db.refresh(lead)
        return lead