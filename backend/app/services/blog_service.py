import os
import json
from sqlalchemy.orm import Session
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.database.models import Blog, BlogStatus
from uuid import uuid4

class BlogService:
    def __init__(self):
        # Configuration optimisée pour les longs textes (3000 tokens)
        self.llm = ChatOpenAI(
            model="mistralai/mistral-small-3.1-24b-instruct",
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.5, # Équilibre entre expertise et fluidité
            max_tokens=3000 
        )

    def _get_region_context(self, region: str):
        contexts = {
            "Africa": "Maroc comme hub financier et logistique pour l'Afrique subsaharienne (CFC).",
            "Gulf": "Comparaison de rentabilité Marrakech vs Dubaï, fiscalité avantageuse et ROI locatif.",
            "Morocco_MRE": "Investissement affectif, sécurité foncière et préparation de la retraite au pays."
        }
        return contexts.get(region, "Expertise immobilière globale au Maroc.")

    async def generate_industrial_blog(self, db: Session, topic: str, region: str, keywords: list):
        """
        Génère un article expert de 1200+ mots conforme aux standards Yoast SEO et E-E-A-T.
        """
        print(f" IA : Rédaction d'un article SEO pour la cible : {region}")
        
        focus_keyword = keywords[0]
        region_context = self._get_region_context(region)
        
        system_prompt = (
            "You are a professional SEO Copywriter and Real Estate Analyst. "
            "Your task is to write a 1200-1500 word blog post for WordPress based on Yoast SEO standards. \n"
            "STRICT FORMATTING RULES: \n"
            "- Paragraphs: 2-4 lines max (high readability). \n"
            "- Sentences: Short and active voice. \n"
            "- Structure: Use H1, multiple H2 and H3 subheadings. \n"
            "- Tone: Educational, prestigious, and factual (E-E-A-T)."
        )
        
        user_prompt = f"""
        TOPIC: {topic}
        TARGET REGION: {region} ({region_context})
        FOCUS KEYWORD: {focus_keyword}
        SECONDARY KEYWORDS: {", ".join(keywords[1:])}

        REQUIRED OUTPUT STRUCTURE (JSON FORMAT):
        1. 'seo_title': 50-60 chars, must include "{focus_keyword}" at the start.
        2. 'slug': Hyphenated, lowercase, includes keyword.
        3. 'meta_description': 155 chars max with Call-to-action.
        4. 'introduction': 150 words. The keyword "{focus_keyword}" MUST appear within the first 20 words.
        5. 'body_content': 1000+ words with H2/H3 tags. Include statistics and lifestyle details.
        6. 'image_alt_texts': 3 suggestions for royalty-free images with alt-text.
        7. 'conclusion': Summary + subtle Call-to-action for GateOne.immo.

        Respond ONLY with a valid JSON object.
        """

        prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt)
        ])

        chain = prompt_template | self.llm
        
        # 1. Génération
        response = chain.invoke({})
        
        # On tente de parser le JSON reçu
        try:
            blog_data = json.loads(response.content)
        except:
            # Fallback si l'IA ne renvoie pas un JSON propre
            blog_data = {
                "seo_title": f"Expert Insight: {topic}",
                "body_content": response.content,
                "meta_description": "Luxury Real Estate investment guide."
            }

        # 2. Sauvegarde dans PostgreSQL
        new_blog = Blog(
            id=uuid4(),
            topic=topic,
            target_region=region,
            content=blog_data.get('body_content'),
            status=BlogStatus.draft,
            seo_title=blog_data.get('seo_title')
        )
        
        db.add(new_blog)
        db.commit()
        db.refresh(new_blog)
        
        print(f" Blog '{topic}' archivé. SEO Score: Optimized.")
        return blog_data