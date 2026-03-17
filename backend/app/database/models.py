import uuid
from sqlalchemy import Column, String, Integer, Numeric, Boolean, ForeignKey, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .connection import Base

# --- Énumérations Python pour la cohérence ---

class LeadStatus(str, enum.Enum):
    new = "new"
    qualified = "qualified"
    viewing = "viewing"
    negotiation = "negotiation"
    closed = "closed"

class DocType(str, enum.Enum):
    contract = "contract"
    id_card = "id_card"
    title_deed = "title_deed"
    lease_agreement = "lease_agreement"

class ActionCategory(str, enum.Enum):
    view_property = "view_property"
    click_whatsapp = "click_whatsapp"
    chatbot_query = "chatbot_query"
    download_pdf = "download_pdf"
    view_listing = "view_listing"

# --- Tables ---

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    properties = relationship("Property", back_populates="agent")

class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text) # On stocke ici les 'features'
    price = Column(Numeric(15, 2), nullable=False)
    location = Column(String(100))
    neighborhood = Column(String(100))
    area_sqm = Column(Integer)
    bedrooms = Column(Integer) 
    bathrooms = Column(Integer)
    type = Column(String(50)) # villa, apartment, riad
    # ---------------------------------
    
    status = Column(String(20), default="available")
    agent_id = Column(Integer, ForeignKey("agents.id"))
    
    agent = relationship("Agent", back_populates="properties")
    media = relationship("PropertyMedia", back_populates="property", cascade="all, delete-orphan")
    documents = relationship("DocumentIntelligence", back_populates="property")

class PropertyMedia(Base):
    __tablename__ = "property_media"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"))
    cloudinary_url = Column(Text, nullable=False)
    is_thumbnail = Column(Boolean, default=False)
    property = relationship("Property", back_populates="media")

class DocumentIntelligence(Base):
    __tablename__ = "documents_intelligence"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    document_type = Column(SQLEnum(DocType))
    ocr_raw_text = Column(Text)
    ai_summary = Column(Text)
    detected_risks = Column(Text)
    expiration_date = Column(DateTime)
    property = relationship("Property", back_populates="documents")

class MarketIntelligence(Base):
    __tablename__ = "market_intelligence"
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), default="Marrakech")
    neighborhood = Column(String(100))
    avg_price_sqm = Column(Numeric(10, 2))
    demand_level = Column(Integer)
    trend_date = Column(DateTime, default=datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(150))
    email = Column(String(150), unique=True)
    current_status = Column(SQLEnum(LeadStatus), default=LeadStatus.new)
    ai_score = Column(Numeric(3, 2), default=0.0)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    interactions = relationship("UserInteraction", back_populates="lead")

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"))
    action_type = Column(SQLEnum(ActionCategory))
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"))
    duration_seconds = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    lead = relationship("Lead", back_populates="interactions")

class AIContentCache(Base):
    __tablename__ = "ai_content_cache"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"))
    language = Column(String(10), nullable=False) # 'fr', 'en', 'ar'
    
    # Le Titre H1 optimisé pour Google
    seo_title = Column(String(255)) 
    
    # Le corps de l'article (Type TEXT car 1500 mots = environ 10 000 caractères)
    # PostgreSQL gère très bien les textes longs sans limite de taille fixe
    article_body = Column(Text, nullable=False) 
    
    # Mots-clés pour les balises Meta de Google
    meta_keywords = Column(Text) 
    
    # Date de génération (pour savoir s'il faut rafraîchir l'article plus tard)
    generated_at = Column(DateTime, default=datetime.utcnow)