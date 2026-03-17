import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from sqlalchemy.orm import Session
# On importe le modèle de cache pour pouvoir enregistrer
from app.database.models import AIContentCache 

load_dotenv()

class AIService:
    def __init__(self):
        # CONFIGURATION VALIDÉE (Mistral via OpenRouter)
        self.llm = ChatOpenAI(
            model="mistralai/mistral-small-3.1-24b-instruct",
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.3,
            max_tokens=3000
        )

    # --- 1. LOGIQUE DE RÉDACTION VALIDÉE PAR LE MARKETING (INCHANGÉE) ---
    def _run_ai_generation(self, data: dict, language: str = "English"):
        """
        Fonction interne qui contient ton 'Master Prompt' validé.
        """
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

    # --- 2. FONCTION DE PRÉVISUALISATION (POUR L'AGENT) ---
    async def get_article_preview(self, property_data: dict, lang: str = "en"):
        """
        Appelle l'IA pour générer une proposition d'article.
        Cette fonction ne sauvegarde RIEN en base de données.
        L'agent pourra ainsi lire et modifier le texte sur le Frontend.
        """
        print(f"IA : Génération d'un brouillon en cours...")
        full_lang = "English" if lang == "en" else "French"
        
        # On lance la génération
        content = self._run_ai_generation(property_data, full_lang)
        
        return content

    # --- 3. FONCTION D'ENREGISTREMENT (APRÈS VALIDATION HUMAINE) ---
    def save_validated_article(self, db: Session, property_id: str, final_content: str, lang: str, seo_title: str):
        """
        Enregistre l'article final (potentiellement modifié par l'agent)
        dans la table ai_content_cache.
        C'est l'étape qui fige le contenu et évite de payer l'API à nouveau.
        """
        print(f"Sauvegarde de l'article validé pour le bien {property_id}...")
        
        new_cache_entry = AIContentCache(
            property_id=property_id,
            language=lang,
            article_body=final_content, # Le texte final relu par l'humain
            seo_title=seo_title
        )
        
        db.add(new_cache_entry)
        db.commit()
        db.refresh(new_cache_entry)
        
        print(f"Article archivé avec succès dans PostgreSQL.")
        return new_cache_entry