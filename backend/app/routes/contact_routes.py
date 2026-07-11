from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database.connection import get_db
from app.database.models import ContactMessage
import uuid, resend, os

router = APIRouter(prefix="/api/contact", tags=["contact"])

class ContactSchema(BaseModel):
    full_name: str
    email: EmailStr
    phone: str = ""
    subject: str
    message: str

async def send_notification_email(data: ContactSchema):
    """Envoie un email de notification à l'agence"""
    resend.api_key = os.getenv("RESEND_API_KEY")
    try:
        resend.Emails.send({
            "from": "GateOne Intelligence <onboarding@resend.dev>",
            "to": os.getenv("AGENCY_EMAIL"),
            "subject": f"Nouveau message : {data.subject}",
            "html": f"""
                <h2>Nouveau message de contact</h2>
                <p><strong>Nom :</strong> {data.full_name}</p>
                <p><strong>Email :</strong> {data.email}</p>
                <p><strong>Téléphone :</strong> {data.phone or 'Non renseigné'}</p>
                <p><strong>Sujet :</strong> {data.subject}</p>
                <hr>
                <p><strong>Message :</strong></p>
                <p>{data.message}</p>
            """
        })
    except Exception as e:
        print(f"Email notification failed: {e}")

@router.post("/send")
async def send_contact_message(
    data: ContactSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Sauvegarder en base
    msg = ContactMessage(
        id=uuid.uuid4(),
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        subject=data.subject,
        message=data.message
    )
    db.add(msg)
    db.commit()

    # 2. Envoyer l'email en tâche de fond (ne bloque pas la réponse)
    background_tasks.add_task(send_notification_email, data)

    return {
        "status": "success",
        "message": "Votre message a bien été reçu. Nous vous répondrons sous 24h."
    }