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
    title_deed = "lease_agreement"
    lease_agreement = "lease_agreement"

class ActionCategory(str, enum.Enum):
    view_property = "view_property"
    click_whatsapp = "click_whatsapp"
    chatbot_query = "chatbot_query"
    download_pdf = "download_pdf"
    view_listing = "view_listing"

class BlogStatus(str, enum.Enum): # Nouveau pour les blogs
    draft = "draft"
    published = "published"
    archived = "archived"

class SocialPlatform(str, enum.Enum): # Nouveau pour les réseaux sociaux
    instagram = "instagram"
    facebook = "facebook"
    linkedin = "linkedin"
    whatsapp = "whatsapp"


# --- TABLES ---

class Agent(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False) 
    role = Column(String(20), default="agent") # 'admin' or 'agent'
    
    properties = relationship("Property", back_populates="agent")
    blogs = relationship("Blog", back_populates="author_agent") # Nouvelle relation pour les blogs

class Property(Base):
    __tablename__ = "properties"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text) # Stocke les features brutes
    price = Column(Numeric(15, 2), nullable=False)
    location = Column(String(100))
    neighborhood = Column(String(100))
    area_sqm = Column(Integer)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    status = Column(String(50), default="available") # available, sold, rented
    type = Column(String(50)) # villa, apartment, riad
    agent_id = Column(Integer, ForeignKey("agents.id"))
    
    agent = relationship("Agent", back_populates="properties")
    media = relationship("PropertyMedia", back_populates="property", cascade="all, delete-orphan")
    documents = relationship("DocumentIntelligence", back_populates="property")
    ai_articles = relationship("AIContentCache", back_populates="property", cascade="all, delete-orphan") # Renommée pour plus de clarté
    social_posts = relationship("SocialPost", back_populates="property", cascade="all, delete-orphan") # Nouvelle relation

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
    demand_index = Column(Integer)
    supply_count = Column(Integer)
    trend_direction = Column(String(20)) # 'up', 'down', 'stable'
    recorded_at = Column(DateTime, default=datetime.utcnow)

class Lead(Base):
    __tablename__ = "leads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(150))
    email = Column(String(150), unique=True)
    hashed_password = Column(String(255), nullable=True) # Ajouté pour le Login Client
    
    current_status = Column(SQLEnum(LeadStatus), default=LeadStatus.new)
    
    # Détails du Scoring (Chapitre 4)
    financial_points = Column(Integer, default=0)  # S_financial (0-50)
    behavioral_points = Column(Integer, default=0) # S_behavioral (0-50)
    ai_score = Column(Numeric(5, 2), default=0.0)  # S_total (0-100)
    
    interactions = relationship("UserInteraction", back_populates="lead")

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"))
    action_type = Column(SQLEnum(ActionCategory))
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=True)
    duration_seconds = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    lead = relationship("Lead", back_populates="interactions")

# --- NOUVELLE TABLE POUR LES ARTICLES DE BLOG ---
class Blog(Base):
    __tablename__ = "blogs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(Integer, ForeignKey("agents.id"), nullable=True) # Qui a écrit/validé le blog
    target_region = Column(String(50)) # 'Africa', 'Gulf', 'Morocco_MRE'
    topic = Column(String(255), nullable=False)
    seo_title = Column(String(255))
    content = Column(Text, nullable=False) # L'article de fond avec stats
    status = Column(SQLEnum(BlogStatus), default=BlogStatus.draft) # draft, published
    created_at = Column(DateTime, default=datetime.utcnow)
    author_agent = relationship("Agent", back_populates="blogs")
    social_posts = relationship("SocialPost", back_populates="blog", cascade="all, delete-orphan") # Lien vers les posts sociaux du blog

# --- NOUVELLE TABLE POUR LES PUBLICATIONS SUR LES RÉSEAUX SOCIAUX ---
class SocialPost(Base):
    __tablename__ = "social_posts"
    id = Column(Integer, primary_key=True, index=True)
    # Peut être lié à une 'Property' OU à un 'Blog'
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=True)
    blog_id = Column(UUID(as_uuid=True), ForeignKey("blogs.id"), nullable=True)
    platform = Column(SQLEnum(SocialPlatform), nullable=False) # Instagram, Facebook, LinkedIn
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    property = relationship("Property", back_populates="social_posts")
    blog = relationship("Blog", back_populates="social_posts")

class AIContentCache(Base):
    __tablename__ = "ai_content_cache"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=True) # Peut être null si on génère du contenu non lié à un bien
    language = Column(String(10), nullable=False) # 'fr', 'en', 'ar'
    seo_title = Column(String(255)) 
    article_body = Column(Text, nullable=False) 
    meta_keywords = Column(Text) 
    is_published = Column(Boolean, default=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="ai_articles")

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name  = Column(String(150), nullable=False)
    email      = Column(String(150), nullable=False)
    phone      = Column(String(50), nullable=True)
    subject    = Column(String(200), nullable=False)
    message    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)