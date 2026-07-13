import httpx
import os
from sqlalchemy.orm import Session
from app.database.models import SocialPost

class SocialDispatcher:
    WEBHOOK_URL = os.getenv("SOCIAL_WEBHOOK_URL") # URL de Zapier ou Make

    @staticmethod
    async def dispatch_post(db: Session, post_id: int):
        post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
        if not post: return False

        # 1. Mise à jour interne (Statut en base de données)
        post.status = "published"
        db.commit()

        # 2. Envoi du signal au monde extérieur (Webhook)
        if SocialDispatcher.WEBHOOK_URL:
            payload = {
                "platform": post.platform,
                "content": post.content,
                "property_id": str(post.property_id),
                "timestamp": str(post.created_at)
            }
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(SocialDispatcher.WEBHOOK_URL, json=payload)
                print(f"🚀 Signal broadcasted to Webhook for {post.platform}")
            except Exception as e:
                print(f"⚠️ Webhook broadcast failed: {e}")
        
        return True