from pymongo import MongoClient
from datetime import datetime
from config import MONGO_URI, DATABASE_NAME


def insert_articles():
    # Connexion à MongoDB Atlas
    client = MongoClient(MONGO_URI)

    # Choisir la base de données et la collection
    db = client[DATABASE_NAME]
    articles_collection = db.articles

    # Supprimer les articles existants pour éviter les doublons
    articles_collection.delete_many({})

    # Liste complète des articles à insérer
    articles = [
        {
            "id": 1,
            "title": "Guide complet pour investir dans l'immobilier au Maroc",
            "excerpt": "Découvrez les meilleures stratégies pour investir dans l'immobilier marocain et maximiser votre retour sur investissement.",
            "content": "L'investissement immobilier au Maroc présente de nombreuses opportunités pour les investisseurs nationaux et internationaux. Le royaume offre un marché dynamique avec des prix attractifs, notamment dans les villes comme Marrakech, Casablanca et Rabat.\n\nLes avantages de l'investissement immobilier au Maroc :\n- Stabilité politique et économique\n- Croissance démographique soutenue\n- Développement du tourisme\n- Réformes favorables aux investisseurs étrangers\n\nLes secteurs porteurs :\n1. L'immobilier résidentiel dans les grandes villes\n2. L'immobilier touristique (riads, villas de vacances)\n3. L'immobilier commercial dans les zones d'activité\n\nConseils pour réussir votre investissement :\n- Bien choisir l'emplacement\n- Étudier le marché local\n- S'entourer de professionnels locaux\n- Respecter la réglementation en vigueur",
            "image": "/images/article-1.jpg",
            "category": "Investissement",
            "tags": ["immobilier", "investissement", "maroc", "guide"],
            "date": "2024-01-15",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 2,
            "title": "Les tendances du marché immobilier à Marrakech en 2024",
            "excerpt": "Analyse des dernières tendances du marché immobilier marrakchi et perspectives pour l'année 2024.",
            "content": "Le marché immobilier de Marrakech continue de montrer une dynamique positive en 2024. La ville ocre attire toujours autant les investisseurs grâce à son patrimoine unique et son potentiel touristique.\n\nTendances observées :\n- Hausse modérée des prix dans les quartiers prisés\n- Forte demande pour les riads authentiques\n- Développement de nouveaux projets résidentiels\n- Intérêt croissant pour l'immobilier écologique\n\nLes quartiers en vogue :\n1. La Médina : pour les riads traditionnels\n2. Gueliz : pour l'immobilier moderne\n3. Hivernage : pour le luxe et le prestige\n4. Targa : pour les nouvelles constructions\n\nPerspectives 2024 :\nLes experts prévoient une stabilisation des prix avec une légère hausse dans les zones les plus demandées. L'amélioration des infrastructures et le développement du tourisme durable devraient soutenir le marché.",
            "image": "/images/article-2.jpg",
            "category": "Marché",
            "tags": ["marrakech", "tendances", "marché", "2024"],
            "date": "2024-01-10",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 3,
            "title": "Comment choisir le bon riad à Marrakech",
            "excerpt": "Conseils d'experts pour sélectionner le riad parfait dans la médina de Marrakech.",
            "content": "L'achat d'un riad à Marrakech est un investissement unique qui nécessite une approche particulière. Ces demeures traditionnelles offrent un charme authentique mais demandent une expertise spécifique.\n\nCritères essentiels à considérer :\n\n1. L'emplacement dans la médina\n- Proximité des souks et attractions\n- Accessibilité pour les véhicules\n- Niveau sonore du quartier\n- Sécurité de la zone\n\n2. L'état structurel\n- Solidité des murs et fondations\n- État de la toiture\n- Système de plomberie et électricité\n- Présence d'humidité\n\n3. L'authenticité architecturale\n- Préservation des éléments traditionnels\n- Qualité des matériaux (tadelakt, zellige)\n- Respect du style architectural marocain\n\n4. Le potentiel de rénovation\n- Possibilités d'aménagement\n- Coût des travaux de restauration\n- Autorisations nécessaires\n\nConseils pratiques :\n- Faire appel à un expert local\n- Vérifier les titres de propriété\n- Négocier le prix en fonction des travaux\n- Prévoir un budget pour la rénovation",
            "image": "/images/article-3.jpg",
            "category": "Conseils",
            "tags": ["riad", "marrakech", "achat", "conseils"],
            "date": "2024-01-05",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 4,
            "title": "L'immobilier de luxe au Maroc : un marché en pleine expansion",
            "excerpt": "Le segment du luxe tire le marché immobilier marocain vers le haut avec des projets d'exception.",
            "content": "Le marché de l'immobilier de luxe au Maroc connaît une croissance remarquable, porté par une clientèle internationale exigeante et des projets d'exception.\n\nLes facteurs de croissance :\n- Attractivité du Maroc pour les investisseurs étrangers\n- Qualité de vie et climat favorable\n- Stabilité politique et économique\n- Développement d'infrastructures de qualité\n\nSegments porteurs :\n\n1. Villas de prestige\n- Propriétés avec piscine et jardin\n- Architecture contemporaine ou traditionnelle\n- Services haut de gamme inclus\n\n2. Appartements de standing\n- Résidences sécurisées\n- Vues panoramiques\n- Finitions premium\n\n3. Riads d'exception\n- Palais restaurés avec soin\n- Emplacements privilégiés\n- Cachet historique unique\n\nZones privilégiées :\n- Marrakech : Palmeraie, Hivernage\n- Casablanca : Ain Diab, Anfa\n- Rabat : Souissi, Hay Riad\n- Tanger : Malabata, Cap Spartel\n\nL'avenir du luxe immobilier marocain s'annonce prometteur avec l'arrivée de nouveaux concepts et l'amélioration continue de l'offre de services.",
            "image": "/images/article-4.jpg",
            "category": "Immobilier",
            "tags": ["luxe", "maroc", "investissement", "prestige"],
            "date": "2023-12-28",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 5,
            "title": "Rénovation de riad : budget et étapes clés",
            "excerpt": "Guide pratique pour budgétiser et planifier la rénovation de votre riad traditionnel.",
            "content": "La rénovation d'un riad est un projet passionnant mais complexe qui nécessite une planification minutieuse et un budget bien défini.\n\nÉtapes de la rénovation :\n\n1. Diagnostic initial\n- Évaluation structurelle complète\n- Identification des problèmes prioritaires\n- Estimation des coûts de base\n\n2. Conception et design\n- Respect de l'architecture traditionnelle\n- Intégration du confort moderne\n- Choix des matériaux authentiques\n\n3. Travaux de gros œuvre\n- Consolidation des structures\n- Réfection de la toiture\n- Mise aux normes électriques et plomberie\n\n4. Finitions traditionnelles\n- Application du tadelakt\n- Pose du zellige\n- Sculpture sur bois et plâtre\n\nBudget type (par m²) :\n- Rénovation légère : 3 000 - 5 000 DH/m²\n- Rénovation complète : 6 000 - 10 000 DH/m²\n- Rénovation de luxe : 12 000 - 20 000 DH/m²\n\nConseils pour maîtriser les coûts :\n- Obtenir plusieurs devis détaillés\n- Prévoir une marge de 20% pour les imprévus\n- Choisir des artisans qualifiés\n- Respecter les délais pour éviter les surcoûts",
            "image": "/images/article-5.jpg",
            "category": "Guide",
            "tags": ["rénovation", "riad", "budget", "travaux"],
            "date": "2023-12-20",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 6,
            "title": "Investir dans l'immobilier locatif au Maroc",
            "excerpt": "Stratégies et conseils pour réussir dans l'investissement locatif immobilier au Maroc.",
            "content": "L'investissement locatif au Maroc offre des opportunités intéressantes pour générer des revenus réguliers et constituer un patrimoine durable.\n\nAvantages de l'investissement locatif :\n- Revenus réguliers et prévisibles\n- Valorisation du capital à long terme\n- Diversification du patrimoine\n- Avantages fiscaux possibles\n\nTypes d'investissement locatif :\n\n1. Location longue durée\n- Appartements familiaux\n- Maisons individuelles\n- Rendement : 4-6% par an\n\n2. Location saisonnière\n- Riads et villas touristiques\n- Appartements meublés\n- Rendement : 8-12% par an\n\n3. Location commerciale\n- Bureaux et locaux commerciaux\n- Entrepôts et espaces industriels\n- Rendement : 6-10% par an\n\nFacteurs de succès :\n- Choix de l'emplacement stratégique\n- Qualité de la propriété et des finitions\n- Gestion locative professionnelle\n- Connaissance du marché local\n\nVilles attractives :\n- Casablanca : marché mature, forte demande\n- Rabat : stabilité, clientèle institutionnelle\n- Marrakech : tourisme, location saisonnière\n- Tanger : développement économique\n\nConseils pratiques :\n- Étudier la demande locative locale\n- Calculer la rentabilité nette\n- Prévoir les frais de gestion et d'entretien\n- Souscrire les assurances appropriées",
            "image": "/images/article-6.jpg",
            "category": "Investissement",
            "tags": ["locatif", "investissement", "rentabilité", "maroc"],
            "date": "2023-12-15",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 7,
            "title": "Les nouvelles zones d'expansion urbaine au Maroc",
            "excerpt": "Découverte des nouveaux pôles de développement urbain et leurs opportunités immobilières.",
            "content": "Le Maroc connaît une expansion urbaine dynamique avec l'émergence de nouvelles zones de développement qui offrent des opportunités immobilières prometteuses.\n\nPrincipales zones d'expansion :\n\n1. Casablanca Finance City\n- Hub financier international\n- Bureaux et résidences haut de gamme\n- Infrastructure moderne\n\n2. Technopolis Rabat\n- Pôle technologique et universitaire\n- Logements étudiants et jeunes actifs\n- Environnement innovant\n\n3. Tanger Med\n- Zone industrielle et portuaire\n- Logements pour les employés\n- Croissance économique soutenue\n\n4. Nouaceur (Casablanca)\n- Proximité de l'aéroport\n- Développement résidentiel\n- Prix attractifs\n\nOpportunités d'investissement :\n- Acquisition à prix préférentiels\n- Potentiel de plus-value important\n- Demande locative croissante\n- Infrastructures en développement\n\nCritères d'évaluation :\n- Plans d'aménagement officiels\n- Calendrier de développement\n- Accessibilité et transports\n- Services et équipements prévus\n\nRisques à considérer :\n- Délais de développement\n- Évolution de la demande\n- Qualité des infrastructures\n- Réglementation urbanistique\n\nConseils d'investissement :\n- Étudier les plans directeurs\n- Vérifier les autorisations\n- Diversifier les investissements\n- Suivre l'évolution des projets",
            "image": "/images/article-7.jpg",
            "category": "Actualités",
            "tags": ["expansion", "urbaine", "développement", "opportunités"],
            "date": "2023-12-10",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

    # Insérer tous les articles
    articles_collection.insert_many(articles)
    print(f"✅ {len(articles)} articles insérés avec succès!")


if __name__ == "__main__":
    insert_articles()
