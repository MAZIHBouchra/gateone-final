import re

class SEOAnalyzer:
    @staticmethod
    def calculate_score(text: str, prop_type: str, intent: str, location: str) -> dict:
        if not text:
            return {"total_score": 0, "grade": "None", "details": []}

        # Construction du mot-clé cible tel que généré par l'IA
        focus_phrase = f"{prop_type} for {intent} in {location}".lower()
        
        # Nettoyage du texte (on enlève les étoiles de gras pour ne pas gêner la recherche)
        clean_text = text.lower().replace("**", "")
        checks = []
        score = 0
        
        # 1. Analyse de la profondeur (40 points)
        words = len(text.split())
        if words >= 1500:
            score += 40
            status = "excellent"
        elif words >= 1200:
            score += 30
            status = "good"
        else:
            score += 15
            status = "poor"
        checks.append({"label": "Content Depth", "status": status, "desc": f"{words} / 1500 words"})

        # 2. Mot-clé dans le Titre H1 (20 points)
        # On cherche la première ligne commençant par #
        lines = text.split('\n')
        h1_line = next((l for l in lines if l.startswith('#')), "").lower()
        if focus_phrase in h1_line:
            score += 20
            checks.append({"label": "Keyword in Title", "status": "excellent", "desc": "Found in H1"})
        else:
            checks.append({"label": "Keyword in Title", "status": "poor", "desc": "Missing in Title"})

        # 3. Structure Sémantique H2/H3 (20 points)
        headers = len(re.findall(r'^#{2,3}\s', text, re.MULTILINE))
        if headers >= 6:
            score += 20
            status = "excellent"
        else:
            score += 10
            status = "poor"
        checks.append({"label": "Heading Flow", "status": status, "desc": f"{headers} semantic sections"})

        # 4. Analyse de l'Introduction (20 points)
        intro = clean_text[:600]
        if focus_phrase in intro:
            score += 20
            checks.append({"label": "Intro focus", "status": "excellent", "desc": "Verified"})
        else:
            checks.append({"label": "Intro focus", "status": "poor", "desc": "Missing in first paragraph"})

        return {
            "total_score": score,
            "grade": "Premium" if score >= 85 else "Institutional" if score >= 60 else "Draft",
            "details": checks
        }