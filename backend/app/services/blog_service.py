import os
import re
from sqlalchemy.orm import Session
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.database.models import Blog, BlogStatus
from uuid import uuid4

class BlogService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="mistralai/mistral-large-2407",
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            temperature=0.7,
            max_tokens=8000 
        )

    def _get_region_context(self, region: str):
        contexts = {
            "Africa": "Morocco as a financial and logistical hub.",
            "Gulf": "Marrakech ROI vs Dubai, tax advantages.",
            "Europe_MRE": "Secure investment for the diaspora.",
            "Global": "Luxury real estate lifestyle."
        }
        return contexts.get(region, "Real estate expertise.")

    async def generate_industrial_blog(self, db: Session, topic: str, region: str, keywords: list):
        print(f"🤖 AI: Writing long-form article for {region}...")
        
        region_context = self._get_region_context(region)
        
        user_prompt = f"""
        Write a 1500-word expert SEO blog post in English.
        TOPIC: {topic}
        TARGET: {region} ({region_context})
        KEYWORDS: {", ".join(keywords)}

        STRUCTURE RULES:
        1. Start with [METADATA] section containing:
           SEO_TITLE: (60 chars)
           SLUG: (url-friendly)
           META_DESCRIPTION: (150 chars)
        2. Then use [CONTENT] section for the full 1500-word article in Markdown.
        3. Use H1, H2, H3 and professional tables.
        """

        response = self.llm.invoke(user_prompt)
        full_text = response.content

        # --- LOGIQUE D'EXTRACTION ROBUSTE (Sans JSON fragile) ---
        seo_title = topic
        slug = "new-article"
        body_content = full_text

        try:
            # On cherche les infos entre les balises
            if "[METADATA]" in full_text and "[CONTENT]" in full_text:
                parts = full_text.split("[CONTENT]")
                body_content = parts[1].strip()
                metadata_part = parts[0]
                
                # Extraction par Regex pour plus de sécurité
                title_match = re.search(r"SEO_TITLE:\s*(.*)", metadata_part)
                slug_match = re.search(r"SLUG:\s*(.*)", metadata_part)
                
                if title_match: seo_title = title_match.group(1).strip()
                if slug_match: slug = slug_match.group(1).strip().replace("/", "")
        except:
            pass

        # Sauvegarde SQL
        new_blog = Blog(
            id=uuid4(),
            topic=topic,
            target_region=region,
            content=body_content,
            status=BlogStatus.draft,
            seo_title=seo_title
        )
        db.add(new_blog)
        db.commit()
        db.refresh(new_blog)
        
        return {
            "id": str(new_blog.id),
            "seo_title": seo_title,
            "slug": slug,
            "body_content": body_content
        }