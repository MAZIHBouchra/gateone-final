from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL", "info@gateone.com")
SENDER_NAME = os.getenv("SENDER_NAME", "GateOne")
# Modes: "smtp" (default, From = SMTP user, Reply-To = visitor) or "user" (From = visitor, Sender = SMTP)
EMAIL_FROM_MODE = os.getenv("EMAIL_FROM_MODE", "smtp").lower()

# Pydantic models
class ContactForm(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    message: str

class EmailResponse(BaseModel):
    success: bool
    message: str

# Create router
email_router = APIRouter(prefix="/email", tags=["email"])

def send_email(contact_data: ContactForm) -> bool:
    """Send email using SMTP with configurable From mode."""
    try:
        # Create message
        msg = MIMEMultipart()

        # Headers according to mode
        if EMAIL_FROM_MODE == "user":
            # From shows the visitor; Sender indicates the authenticated account
            msg['From'] = f"{contact_data.first_name} {contact_data.last_name} <{contact_data.email}>"
            msg['Sender'] = f"{SENDER_NAME} <{SMTP_USERNAME}>"
            msg['Reply-To'] = contact_data.email
        else:
            # Safe default: From is your authenticated account
            msg['From'] = f"{SENDER_NAME} <{SMTP_USERNAME}>"
            msg['Reply-To'] = contact_data.email

        msg['To'] = RECIPIENT_EMAIL
        msg['Subject'] = (
            f"New Contact Form Submission from {contact_data.first_name} {contact_data.last_name}"
        )
        
        # Create HTML body
        html_body = f"""
        <html>
        <body>
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> {contact_data.first_name} {contact_data.last_name}</p>
            <p><strong>Email:</strong> {contact_data.email}</p>
            <p><strong>Phone:</strong> {contact_data.phone}</p>
            <p><strong>Message:</strong></p>
            <p>{contact_data.message.replace(chr(10), '<br>')}</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email with explicit envelope sender to avoid SPF/DMARC issues
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        envelope_from = SMTP_USERNAME  # MAIL FROM at SMTP level
        recipients = [addr.strip() for addr in RECIPIENT_EMAIL.split(',') if addr.strip()]
        server.sendmail(envelope_from, recipients, msg.as_string())
        server.quit()
        
        return True
        
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        return False

@email_router.post("/send-contact", response_model=EmailResponse)
async def send_contact_email(contact_data: ContactForm):
    """Send contact form email"""
    
    # Validate required environment variables
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Email configuration not set. Please check SMTP_USERNAME and SMTP_PASSWORD environment variables."
        )
    
    # Send email
    success = send_email(contact_data)
    
    if success:
        return EmailResponse(
            success=True,
            message="Email sent successfully!"
        )
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to send email. Please try again later."
        )

@email_router.get("/config")
async def email_config():
    """Check email configuration status"""
    return {
        "email_configured": bool(SMTP_USERNAME and SMTP_PASSWORD),
        "smtp_server": SMTP_SERVER,
        "smtp_port": SMTP_PORT,
        "recipient_email": RECIPIENT_EMAIL,
        "sender": f"{SENDER_NAME} <{SMTP_USERNAME}>",
        "from_mode": EMAIL_FROM_MODE
    }
