import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

class AIContentGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="mistralai/mistral-small-3.1-24b-instruct",
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.4, # On baisse la température pour être plus factuel (E-E-A-T)
            max_tokens=2500  # On augmente pour atteindre les 1500 mots demandés
        )

    def generate_seo_article(self, data: dict, language: str = "English"):
        system_prompt = (
            "You are an expert real estate SEO writer specialized in luxury property listings. "
            "Your Task: Generate a complete SEO-optimized property article (900-1300 words). "
            "RULES: Use clear, factual language. NO poetic fluff. Focus on E-E-A-T guidelines."
        )
        
        # On définit les placeholders sans le 'f' devant pour laisser LangChain gérer
        user_prompt = """
        Generate a professional real estate article in {language} for this property:
        
        DATA PROVIDED:
        - Title: {title}
        - Type: {type}
        - Location: {location}
        - Price: {price}
        - Plot Size: {plot_size}
        - Built Size: {built_size}
        - Bedrooms: {bedrooms}
        - Features: {features}
        - Neighborhood: {neighborhood}
        - Investment: {investment}

        STRUCTURE TO FOLLOW (MANDATORY):
        1. SEO TITLE (H1): Property Type | Location | Main Keyword.
        2. INTRODUCTION: Factual storytelling (80-120 words).
        3. PROPERTY OVERVIEW: Table of technical data.
        4. PROPERTY FEATURES: Materials and architecture.
        5. INTERIOR DESIGN: Specific focus on lighting and layout.
        6. EXTERIOR SPACES: Gardens and pools.
        7. NEIGHBORHOOD GUIDE: Amenities and distance to airport.
        8. INVESTMENT POTENTIAL: ROI and rental demand.
        9. PROPERTY HIGHLIGHTS: Bullet points.
        10. LEGAL INFO: VNA status and fees.
        11. CALL TO ACTION: Contact GateOne.immo.

        SEO KEYWORDS: [Luxury Riad Marrakech, Medina Property Sale, Real Estate Investment Morocco].
        """

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt)
        ])

        chain = prompt_template | self.llm
        
        # ICI EST LA CORRECTION : On passe TOUTES les données de 'data' + le 'language'
        # On utilise **data pour extraire automatiquement title, price, etc.
        response = chain.invoke({
            "language": language,
            **data 
        })
        
        return response.content

# --- TEST AVEC LES NOUVELLES RÈGLES ---
if __name__ == "__main__":
    generator = AIContentGenerator()
    test_data = {
        "title": "Palais de la Palmeraie",
        "type": "Villa / Palace",
        "location": "Palmeraie, Marrakech",
        "price": "12,000,000 MAD",
        "plot_size": "5000 m2",
        "built_size": "800 m2",
        "bedrooms": 6,
        "features": "Piscine chauffée, Hammam, Domotique, Marbre de Carrare",
        "neighborhood": "Sécurisé, proche Golf",
        "investment": "Haut rendement locatif saisonnier"
    }
    print(generator.generate_seo_article(test_data))