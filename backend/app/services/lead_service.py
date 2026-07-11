from sqlalchemy.orm import Session
from app.database.models import Lead, UserInteraction, LeadStatus, ActionCategory


class LeadIntelligenceService:

    # 1. Poids des actions (Tableau 4.1 du rapport)
    WEIGHTS = {
        ActionCategory.click_whatsapp: 30,
        ActionCategory.download_pdf: 20,
        ActionCategory.chatbot_query: 15,
        ActionCategory.view_property: 5,
        ActionCategory.view_listing: 2,
    }

    # Plafond individuel par catégorie
    MAX_OCCURRENCES = {
        ActionCategory.click_whatsapp: 2,
        ActionCategory.download_pdf: 2,
        ActionCategory.chatbot_query: 3,
        ActionCategory.view_property: 6,
        ActionCategory.view_listing: 5,
    }

    @staticmethod
    def calculate_financial_score(budget_tier: str) -> int:
        """
        Calcule S_financial (Tableau 4.2 du rapport).
        Passé au moment de l'inscription (Sign Up).
        """
        mapping = {
            "VIP": 50,
            "PREMIUM": 30,
            "STANDARD": 15,
            "ENTRY": 5,
        }

        return mapping.get(budget_tier, 0)

    @classmethod
    def calculate_behavioral_score(cls, db: Session, lead_id: str) -> int:
        """
        Recalcule S_behavioral depuis l'historique complet des interactions,
        avec plafonnement individuel par catégorie d'action.

        Formule :
        S_behavioral = min(Σ wi × min(ni, max_i), 50)
        """

        interactions = (
            db.query(UserInteraction)
            .filter(UserInteraction.lead_id == lead_id)
            .all()
        )

        counts = {}

        for interaction in interactions:
            action = interaction.action_type
            counts[action] = counts.get(action, 0) + 1

        total = 0

        for action, count in counts.items():
            capped_count = min(
                count,
                cls.MAX_OCCURRENCES.get(action, count)
            )

            total += cls.WEIGHTS.get(action, 0) * capped_count

        return min(total, 50)

    @classmethod
    async def recalculate_score(cls, db: Session, lead_id: str):
        """
        Recalcule S_behavioral et S_total à partir de l'historique existant
        en base.

        Ne crée AUCUNE interaction : cette responsabilité reste
        à la charge de la route appelante.
        """

        lead = db.query(Lead).filter(Lead.id == lead_id).first()

        if not lead:
            return None

        # 1. Recalcul du score comportemental
        lead.behavioral_points = cls.calculate_behavioral_score(db, lead_id)

        # 2. Mise à jour du score total
        lead.ai_score = float(
            lead.behavioral_points + lead.financial_points
        )

        # 3. Mise à jour automatique du statut
        if lead.ai_score >= 80:
            lead.current_status = LeadStatus.qualified

        elif (
            40 <= lead.ai_score < 80
            and lead.current_status == LeadStatus.new
        ):
            lead.current_status = LeadStatus.viewing

        db.commit()
        db.refresh(lead)

        return lead