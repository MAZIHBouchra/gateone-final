from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Lead, UserInteraction, LeadStatus, ActionCategory
from datetime import datetime

class LeadService:
    def __init__(self):
        # Professional Scoring Weights
        self.WEIGHTS = {
            ActionCategory.click_whatsapp: 30,  # Intent to talk
            ActionCategory.chatbot_query: 15,   # Interest in details
            ActionCategory.download_pdf: 20,    # High interest (wants to keep info)
            ActionCategory.view_property: 5,    # Basic interest
            ActionCategory.view_listing: 2      # Passive browsing
        }
        self.MAX_BEHAVIOR_POINTS = 50 
        self.VIP_BUDGET_THRESHOLD = 10_000_000 # 10M MAD

    def calculate_behavior_score(self, interactions) -> float:
        """
        Calculates a score based on the diversity and weight of actions.
        """
        total = 0
        for inter in interactions:
            total += self.WEIGHTS.get(inter.action_type, 0)
        
        # We cap the behavior score to avoid skewing the total
        return float(min(total, self.MAX_BEHAVIOR_POINTS))

    def get_budget_points(self, lead_budget: float) -> float:
        """
        Awards points based on the financial capacity (Lead Qualification).
        """
        if lead_budget >= self.VIP_BUDGET_THRESHOLD:
            return 50.0
        elif lead_budget >= 5_000_000:
            return 30.0
        elif lead_budget >= 1_000_000:
            return 15.0
        return 5.0

    async def refresh_lead_intelligence(self, db: Session, lead_id: str, estimated_budget: float = 0):
        """
        Main engine to update Lead AI Score and Status.
        """
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            return None

        # 1. Fetch all real interactions
        interactions = db.query(UserInteraction).filter(
            UserInteraction.lead_id == lead_id
        ).all()

        # 2. Compute components of the AI Score
        behavior_score = self.calculate_behavior_score(interactions)
        financial_score = self.get_budget_points(estimated_budget)

        # 3. Final Score (on 100)
        final_score = behavior_score + financial_score
        lead.ai_score = final_score

        # 4. Smart Status Automation
        # Logic: If high score, move to 'Qualified'
        if final_score >= 80:
            lead.current_status = LeadStatus.qualified
        elif final_score >= 40 and lead.current_status == LeadStatus.new:
            # Intermediate phase (optional: you could add an 'engaged' status)
            pass
        
        db.commit()
        db.refresh(lead)
        
        print(f"DEBUG: Lead {lead.full_name} updated. AI Score: {final_score}/100")
        return lead