import os
import json
import re
from uuid import uuid4
from dotenv import load_dotenv

# --- CES DEUX LIGNES SONT CELLES QUI MANQUENT ---
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
# -----------------------------------------------

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal 
from app.database.models import Blog, SocialPost, AIContentCache, BlogStatus

load_dotenv()

class AIService:
    def __init__(self):
        # --- CONFIGURATION GEMINI 1.5 FLASH (GRATUIT & PUISSANT) ---
        self.llm = ChatOpenAI(
            model="mistralai/mistral-large-2407", # Le modèle le plus puissant
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.3,
            max_tokens=8000 # On augmente énormément pour ne jamais être coupé
        )

    def _clean_json_response(self, raw_text: str) -> dict:
        """Nettoyeur de JSON identique au précédent"""
        try:
            text = raw_text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            text = "".join(char for char in text if ord(char) >= 32)
            return json.loads(text)
        except Exception as e:
            return {
                "seo_title": "Article Généré",
                "body_content": raw_text,
                "instagram": "Voir texte brut",
                "facebook": "Voir texte brut"
            }

    # --- 1. GÉNÉRATEUR D'ARTICLE (TON PROMPT VALIDÉ) ---
    def generate_seo_article(self, data: dict, language: str = "English"):
        main_keyword = f"{data.get('type')} for {data.get('intent')} in {data.get('location')}"
        
        system_prompt = (
            "You are a senior Real Estate SEO Analyst and Luxury Copywriter. "
            "Your mission is to generate an extensive, high-end property article (1000-1500 words). "
            f"STRICT RULES: \n"
            f"1. Use ONLY the term '{data.get('type')}' throughout the article. \n"
            "2. SECTION 3 MUST BE A MARKDOWN TABLE. \n"
            "3. NO POETIC FLUFF. Replace 'nestled' with factual data. \n"
            "4. Word count focus: Be extremely descriptive."
        )
        
        user_prompt = """
        Generate a professional SEO article in {language} for this property:
        DATA: {data_json}
        FOLLOW THIS STRUCTURE EXACTLY:
        1. SEO TITLE (H1): Use exactly: {type} for {intent} in {location} - [Unique Point]
        2. INTRODUCTION: 120 words. Keyword "{main_keyword}" in first 20 words.
        3. PROPERTY OVERVIEW: MARKDOWN TABLE (Feature | Specification).
        4. ARCHITECTURE & INTERIOR: Min 250 words.
        5. EXTERIOR & AMENITIES: Min 250 words.
        6. NEIGHBORHOOD: Min 200 words.
        7. INVESTMENT POTENTIAL: Min 150 words.
        8. LEGAL & CONTACT: VNA/Title status.
        """

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt)
        ])

        chain = prompt_template | self.llm
        response = chain.invoke({
            "language": language,
            "main_keyword": main_keyword,
            "data_json": str(data),
            **data
        })
        return response.content

    # --- 2. FONCTION DE PRÉVISUALISATION (NOUVEAU - POUR TON FRONTEND) ---
    async def get_article_preview(self, property_data: dict, lang: str = "en"):
        """
        Appelle l'IA pour générer une proposition d'article pour l'aperçu.
        Ne sauvegarde RIEN en base de données à cette étape.
        """
        print(f"🤖 IA : Génération d'un brouillon pour aperçu...")
        full_lang = "English" if lang == "en" else "French"
        
        # On lance la génération pure
        content = self.generate_seo_article(property_data, full_lang)
        
        return content

    # --- 3. FONCTION D'ENREGISTREMENT VALIDÉ (NOUVEAU - POUR TON FRONTEND) ---
    def save_validated_article(self, db: Session, property_id: str, final_content: str, lang: str, seo_title: str):
        """
        Sauvegarde l'article final (après que l'agent l'ait relu et éventuellement modifié)
        dans la table ai_content_cache.
        """
        print(f"💾 Sauvegarde de l'article validé par l'humain pour le bien {property_id}...")
        
        new_cache_entry = AIContentCache(
            property_id=property_id,
            language=lang,
            article_body=final_content, 
            seo_title=seo_title
        )
        
        db.add(new_cache_entry)
        db.commit()
        db.refresh(new_cache_entry)
        
        print(f"✅ Article archivé avec succès dans PostgreSQL.")
        return new_cache_entry

    # --- 4. GÉNÉRATEUR PACK RÉSEAUX SOCIAUX ---
    async def generate_social_media_pack(self, article_content: str, property_data: dict):
        city = property_data.get('location', 'Marrakech')
        prop_type = property_data.get('type', 'Property')

        social_prompt = f"""
        Return ONLY a JSON object. No intro, no outro.
        Structure: {{"instagram": "...", "facebook": "..."}}
        Article context: {article_content[:1000]}
        """
        response = self.llm.invoke(social_prompt)
        return response.content

    # --- 5. ORCHESTRATEUR AUTOMATIQUE (PROPRIÉTÉS) ---
    async def generate_complete_marketing_package(self, property_id: str, property_data: dict):
    # ÉTAPE 1 : On génère TOUT le contenu SANS ouvrir la base de données
      try:
        print(f"⚙️ IA : Analyse du bien {property_id} démarrée...")
        
        # Ce sont les appels longs (environ 1 minute au total)
        article_text = self.generate_seo_article(property_data, "English")
        social_raw = await self.generate_social_media_pack(article_text, property_data)
        social_data = self._clean_json_response(social_raw)
        
        # ÉTAPE 2 : Une fois que tout est prêt, on ouvre la DB seulement pour sauvegarder
        db = SessionLocal()
        try:
            print(f"💾 Persistance des données d'intelligence...")
            
            # Sauvegarde article
            self.save_validated_article(
                db, 
                property_id, 
                article_text, 
                "en", 
                f"Luxury {property_data.get('type')} in {property_data.get('location')}"
            )

            # Sauvegarde Social Media
            for platform in ["instagram", "facebook"]:
                if platform in social_data:
                    db.add(SocialPost(
                        property_id=property_id, 
                        platform=platform, 
                        content=social_data[platform]
                    ))
            
            db.commit()
            print(f"✅ Orchestration terminée avec succès pour {property_id}")
            return True

        except Exception as db_err:
            db.rollback()
            print(f"❌ Erreur DB (pendant l'enregistrement) : {str(db_err)}")
            return False
        finally:
            db.close() # On libère la connexion immédiatement

      except Exception as ai_err:
        print(f"❌ Erreur AI (pendant la génération) : {str(ai_err)}")
        return False

    # --- 6. ORCHESTRATEUR ÉDITORIAL (BLOG) ---
    async def generate_expert_blog_workflow(self, db: Session, topic: str, region: str, keywords: list):
        try:
            print(f"✍️ Rédaction de l'article expert pour {region}...")
            focus_keyword = keywords[0]
            blog_prompt = f"Write a 1200-1500 word blog post for {region} about {topic}. Focus on {focus_keyword}."
            
            blog_raw = self.llm.invoke(blog_prompt)
            blog_data = self._clean_json_response(blog_raw.content)

            new_blog = Blog(id=uuid4(), topic=topic, target_region=region, content=blog_data.get('body_content', ''), seo_title=blog_data.get('seo_title', ''), status=BlogStatus.draft)
            db.add(new_blog)
            db.commit()
            return blog_data
        except Exception as e:
            db.rollback()
            raise e