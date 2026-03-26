from sqlalchemy.orm import Session
from app.database.models import Lead, UserInteraction, LeadStatus
from datetime import datetime

class LeadService:
    def __init__(self):
        # Barème de notation (Excellence Ingénierie)
        self.POINTS_WHATSAPP = 30    # Contact direct = très sérieux
        self.POINTS_PER_VIEW = 5     # Chaque villa regardée montre l'intérêt
        self.MAX_VIEW_POINTS = 30    # On plafonne pour éviter les robots
        self.POINTS_HIGH_BUDGET = 40 # Budget > 5M MAD

    def calculate_score(self, budget: float, interaction_count: int, has_whatsapp: bool) -> float:
        """
        Algorithme de calcul du score de 0 à 100.
        """
        score = 0
        
        # 1. Analyse du Budget (Max 40 points)
        if budget >= 10000000: # > 10M MAD
            score += 40 #Client VIP
        elif budget >= 5000000: # > 5M MAD
            score += 25
        elif budget >= 1000000:
            score += 10
            
        # 2. Analyse du comportement (Max 30 points)
        # On donne 5 points par propriété vue
        behavior_score = interaction_count * self.POINTS_PER_VIEW
        score += min(behavior_score, self.MAX_VIEW_POINTS)
        
        # 3. Analyse du canal de communication (Max 30 points)
        if has_whatsapp:
            score += self.POINTS_WHATSAPP
            
        return float(score)

    async def refresh_lead_intelligence(self, db: Session, lead_id: str):
        """
        Met à jour le score et le statut d'un client dans la base Neon.
        """
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return None

        # Récupération du nombre d'interactions réelles
        interaction_count = db.query(UserInteraction).filter(
            UserInteraction.lead_id == lead_id
        ).count()

        # Calcul du nouveau score
        new_score = self.calculate_score(
            budget=float(lead.ai_score or 0), # On imagine que le budget est stocké ou passé ici
            interaction_count=interaction_count,
            has_whatsapp=True # Donnée à récupérer du système de messagerie
        )

        # Mise à jour de la base de données
        lead.ai_score = new_score
        
        # Logique de changement de statut automatique
        if new_score >= 80:
            lead.current_status = LeadStatus.qualified
        
        db.commit()
        db.refresh(lead)
        
        print(f" Intelligence Lead : {lead.full_name} a maintenant un score de {new_score}/100")
        return lead