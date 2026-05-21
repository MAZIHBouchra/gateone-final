import os
import json
import re
from uuid import uuid4
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from sqlalchemy.orm import Session

# Importation des modèles
from app.database.models import Blog, SocialPost, AIContentCache, BlogStatus

load_dotenv()

class AIService:
    def __init__(self):
        # CONFIGURATION VALIDÉE
        self.llm = ChatOpenAI(
            model="mistralai/mistral-small-3.1-24b-instruct",
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.3,
            max_tokens=3000 
        )

    def _clean_json_response(self, raw_text: str) -> dict:
        try:
            # Nettoyage plus agressif
            text = raw_text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            
            # Suppression des caractères de contrôle invisibles qui font planter JSON
            text = "".join(char for char in text if ord(char) >= 32)
            
            return json.loads(text)
        except Exception as e:
            print(f" Échec total du parsing JSON. Sauvegarde en mode texte brut.")
            # Si le JSON est mort, on crée un dictionnaire de secours 
            # pour ne pas perdre les 1500 mots générés !
            return {
                "seo_title": "Article Généré",
                "body_content": raw_text, # On garde tout le texte brut
                "instagram": "Voir texte brut",
                "facebook": "Voir texte brut"
            }

    # --- 1. GÉNÉRATION DE L'ARTICLE SEO (LOGIQUE VALIDÉE) ---
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

    # --- 2. GÉNÉRATION DU PACK RÉSEAUX SOCIAUX ---
    async def generate_social_media_pack(self, article_content: str, property_data: dict):
        city = property_data.get('location', 'Marrakech')
        prop_type = property_data.get('type', 'Property')

        social_prompt = f"""
        En tant qu'expert Social Media pour l'immobilier de prestige, réédite l'article suivant pour Instagram et Facebook.
        
        ARTICLE : {article_content[:1000]}...
        DONNÉES : {property_data}

        1. POST INSTAGRAM :
        - Style luxueux et sobre.
        - Utilise des puces élégantes pour 3 atouts.
        - EMOJIS : Maximum 2 qualitatifs.
        - HASHTAGS : Génère 5 hashtags dynamiques basés sur : #{city}RealEstate, #{prop_type}, #GateOne.

        2. POST FACEBOOK :
        - Un ton descriptif mais engageant. Focus investissement.
        - Maximum 2 emojis discrets.

        Réponds au format JSON STRICT : 
        {{
            "instagram": "le texte ici",
            "facebook": "le texte ici"
        }}
        """

        response = self.llm.invoke(social_prompt)
        return response.content

    # --- 3. ORCHESTRATEUR PROPRIÉTÉS ---
    async def generate_complete_marketing_package(self, db: Session, property_id: str, property_data: dict):
        try:
            article_text = self.generate_seo_article(property_data, "English")
            
            new_cache = AIContentCache(
                property_id=property_id,
                language="en",
                article_body=article_text,
                seo_title=f"Luxury {property_data.get('type')} in {property_data.get('location')}"
            )
            db.add(new_cache)
            db.commit()

            social_raw = await self.generate_social_media_pack(article_text, property_data)
            social_data = self._clean_json_response(social_raw)

            for platform in ["instagram", "facebook"]:
                if platform in social_data:
                    new_post = SocialPost(
                        property_id=property_id,
                        platform=platform,
                        content=social_data[platform]
                    )
                    db.add(new_post)
            
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"❌ Erreur Orchestration : {str(e)}")
            return False

    # --- 4. ORCHESTRATEUR ÉDITORIAL (BLOG) ---
    async def generate_expert_blog_workflow(self, db: Session, topic: str, region: str, keywords: list):
        try:
            print(f" Rédaction de l'article expert pour {region}...")
            focus_keyword = keywords[0]
            
            blog_prompt = f"""
            You are a Senior Real Estate Analyst. Write a 1200-1500 word blog post in English.
            TOPIC: {topic} | TARGET REGION: {region} | FOCUS KEYWORD: {focus_keyword}
            RULES:
            - Yoast SEO: Short paragraphs, transition words, active voice.
            - First 20 words MUST include: "{focus_keyword}".
            RESPOND ONLY IN JSON:
            {{
                "seo_title": "H1 title",
                "slug": "url-friendly-slug",
                "meta_description": "155 chars max",
                "body_content": "Full article with HTML tags H2, H3, P",
                "image_alt": "Alt text"
            }}
            """
            
            blog_raw = self.llm.invoke(blog_prompt)
            # Utilisation du nettoyeur de JSON pour éviter les erreurs de caractères de contrôle
            blog_data = self._clean_json_response(blog_raw.content)

            new_blog = Blog(
                id=uuid4(),
                topic=topic,
                target_region=region,
                content=blog_data.get('body_content', ''),
                seo_title=blog_data.get('seo_title', ''),
                status=BlogStatus.draft
            )
            db.add(new_blog)
            db.commit()
            db.refresh(new_blog)

            # Déclinaison Sociale
            social_raw = await self.generate_social_media_pack(blog_data.get('body_content', ''), {"location": "Marrakech", "type": "Expert Insight"})
            social_data = self._clean_json_response(social_raw)

            for platform in ["instagram", "facebook"]:
                if platform in social_data:
                    db.add(SocialPost(blog_id=new_blog.id, platform=platform, content=social_data[platform]))
            
            db.commit()
            print(f" Blog et Social Pack finalisés pour : {topic}")
            return blog_data

        except Exception as e:
            db.rollback()
            print(f" Erreur Workflow Blog : {str(e)}")
            raise e