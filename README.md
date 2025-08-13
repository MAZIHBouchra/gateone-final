# 🏠 GateOne Estate Showcase

## 📋 Vue d'ensemble

**GateOne Estate Showcase** est une plateforme web moderne dédiée à l'immobilier de luxe au Maroc. Cette application combine une interface utilisateur élégante avec un chatbot intelligent et des services de communication automatisés.

## ✨ Fonctionnalités principales

### 🏘️ Gestion immobilière
- **Catalogue de propriétés** : Riads, Villas, Appartements de luxe
- **Recherche avancée** : Filtrage par type, prix, localisation
- **Détails complets** : Photos, descriptions, caractéristiques techniques
- **Propriétés vedettes** : Mise en avant des biens d'exception

### 🤖 Chatbot intelligent
- **Assistant IA** : Basé sur LangChain et RAG
- **Connaissance spécialisée** : Base de données sur l'immobilier marocain
- **Réponses contextuelles** : Utilise l'historique de conversation
- **Interface intuitive** : Chat en temps réel intégré

### 📧 Services de communication
- **Formulaire de contact** : Interface de prise de contact
- **Envoi d'emails automatisés** : Notifications et confirmations
- **Gestion des demandes** : Suivi des prospects

### 📰 Contenu éditorial
- **Blog/Journal** : Articles sur l'immobilier
- **Conseils d'investissement** : Ressources pour investisseurs
- **Actualités du marché** : Informations immobilières

### 📊 Outils d'investissement
- **Prédiction de prix** : Analyse de marché
- **Guide d'investissement** : Ressources et conseils
- **Analyse de rentabilité** : Outils de calcul

## 🏗️ Architecture technique

### Frontend (React + TypeScript)
- **React 18** avec TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants
- **React Router** pour la navigation

### Backend (FastAPI + Python)
- **FastAPI** pour l'API REST
- **LangChain** pour l'IA conversationnelle
- **OpenAI/OpenRouter** pour le modèle de langage
- **FAISS** pour la recherche vectorielle
- **Pandas** pour la gestion des données

## 🚀 Installation

### Prérequis
- Node.js 18+ et npm
- Python 3.8+
- Git

### 1. Cloner le projet
```bash
git clone <repository-url>
cd gateone-estate-showcase
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirement.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Structure du projet

```
gateone-estate-showcase/
├── backend/                 # API FastAPI
│   ├── main.py             # Point d'entrée
│   ├── chatbot_api.py      # Logique IA
│   ├── chatbot_routes.py   # Routes chatbot
│   └── email_routes.py     # Routes email
└── frontend/               # Application React
    ├── src/
    │   ├── components/     # Composants UI
    │   ├── pages/          # Pages de l'app
    │   ├── data/           # Données statiques
    │   └── hooks/          # Hooks personnalisés
    └── package.json
```

## 🔧 Configuration

### Variables d'environnement
```env
OPENAI_API_KEY=your_openrouter_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Personnalisation
- Modifiez `gateone_chatbot.csv` pour les Q&A du chatbot
- Ajustez `tailwind.config.ts` pour le thème
- Personnalisez les images dans `src/assets/`

## 🚀 Déploiement

**Backend :** Compatible Heroku, Railway
**Frontend :** Compatible Vercel, Netlify

## 📞 Support

Pour toute question, ouvrez une issue sur GitHub.

---

**GateOne Estate Showcase** - Votre partenaire pour l'immobilier de luxe au Maroc 🇲🇦
