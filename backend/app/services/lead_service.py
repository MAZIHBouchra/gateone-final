from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.models import Lead, UserInteraction, LeadStatus, ActionCategory


class LeadService:
    def __init__(self):
        # Poids metier professionnels (total comportemental plafonné à 50 pts)
        self.WEIGHTS = {
            ActionCategory.click_whatsapp: 30,  # Intention de contact directe
            ActionCategory.download_pdf:   20,  # Interet fort (veut garder l'info)
            ActionCategory.chatbot_query:  15,  # Interet pour les details
            ActionCategory.view_property:   5,  # Interet basique
            ActionCategory.view_listing:    2,  # Navigation passive
        }
        self.MAX_BEHAVIOR_POINTS = 50   # Plafond comportemental
        self.VIP_BUDGET_THRESHOLD = 10_000_000  # 10M MAD

    def calculate_behavior_score(self, interactions: list) -> float:
        """
        Calcule un score base sur la diversite et le poids des actions.
        Plafonne a MAX_BEHAVIOR_POINTS pour eviter le biais comportemental.
        """
        total = sum(self.WEIGHTS.get(inter.action_type, 0) for inter in interactions)
        return float(min(total, self.MAX_BEHAVIOR_POINTS))

    def get_budget_points(self, lead_budget: float) -> float:
        """
        Attribue des points selon la capacite financiere du lead.
        Score financier sur 50 pts => Total final sur 100 pts.
        """
        if lead_budget >= self.VIP_BUDGET_THRESHOLD:
            return 50.0
        elif lead_budget >= 5_000_000:
            return 30.0
        elif lead_budget >= 1_000_000:
            return 15.0
        return 5.0

    def _compute_new_status(self, lead: Lead, final_score: float) -> LeadStatus:
        """
        Logique de changement de statut automatique selon le score final.
        Centralise la logique pour faciliter les evolutions futures.
        """
        if final_score >= 80:
            # Lead hautement qualifie -> passage automatique en Qualified
            return LeadStatus.qualified
        elif final_score >= 40:
            # Lead engage -> passage en viewing si encore au stade new
            if lead.current_status == LeadStatus.new:
                return LeadStatus.viewing
            return lead.current_status  # On ne retrograde jamais un lead
        else:
            # Score faible -> statut inchange
            return lead.current_status

    async def refresh_lead_intelligence(
        self,
        db: AsyncSession,   # CORRECTION : AsyncSession pour compatibilite SQLAlchemy async
        lead_id: str,
        estimated_budget: float = 0.0,  # Vient du profil Lead (formulaire de qualification)
    ) -> Lead | None:
        """
        Moteur principal : met a jour le AI Score et le statut du Lead.
        Retourne le Lead mis a jour ou None si introuvable.
        """
        # CORRECTION : utilisation de select() async
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()

        if not lead:
            return None

        # 1. Recuperer toutes les interactions reelles
        interactions_result = await db.execute(
            select(UserInteraction).where(UserInteraction.lead_id == lead_id)
        )
        interactions = interactions_result.scalars().all()

        # 2. Calculer les composantes du score
        behavior_score = self.calculate_behavior_score(interactions)
        financial_score = self.get_budget_points(estimated_budget)

        # 3. Score final sur 100
        final_score = behavior_score + financial_score
        lead.ai_score = final_score

        # 4. CORRECTION : logique de statut complete (plus de dead code)
        lead.current_status = self._compute_new_status(lead, final_score)

        await db.commit()
        await db.refresh(lead)

        print(
            f"[LeadService] Lead '{lead.full_name}' mis a jour. "
            f"Score: {final_score}/100 | "
            f"Comportemental: {behavior_score}/50 | "
            f"Financier: {financial_score}/50 | "
            f"Statut: {lead.current_status.value}"
        )
        return lead
