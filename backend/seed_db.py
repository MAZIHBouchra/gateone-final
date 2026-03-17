import uuid
import os
from database.connection import SessionLocal
from database.models import Property, AIContentCache
from backend.services.ai_service import AIContentGenerator

def seed_real_estate_data():
    # 1. Initialisation
    db = SessionLocal()
    generator = AIContentGenerator()
    
    # Données extraites de tes fiches techniques (Prix convertis en MAD : 1€ = 10.8 MAD)
    properties_list = [
        {
            "intent": "Sale",
            "title": "Modern 2-Bedroom Apartment Burj Malak",
            "type": "Apartment",
            "location": "Burj Malak Residence, Marrakech",
            "price": "1,188,000 MAD",
            "plot_size": "N/A",
            "built_size": "73 m2",
            "bedrooms": 2,
            "bathrooms": 1,
            "staff_rooms": "No",
            "parking": "Underground parking",
            "security": "24/7 security",
            "garden_details": "N/A",
            "distance_center": "Walking distance to shopping centers and restaurants",
            "accessibility": "Direct elevator access",
            "features": "Open-plan living area, fully equipped kitchen, private balcony with city views",
            "neighborhood": "Prestigious and central district",
            "investment": "Excellent choice for young professionals or as a rental investment"
        },
        {
            "intent": "Sale",
            "title": "Traditional Riad Marrakech House",
            "type": "Riad",
            "location": "Marrakech Medina",
            "price": "7,452,000 MAD",
            "plot_size": "600 m2",
            "built_size": "335 m2",
            "bedrooms": 4,
            "bathrooms": 5,
            "staff_rooms": "Yes, dedicated staff quarters",
            "parking": "Private parking for 2 cars",
            "security": "Gated Medina access",
            "garden_details": "Central patio with private pool",
            "distance_center": "Near City Center & Airport",
            "accessibility": "Traditional Medina entry with car access",
            "features": "Zellige tiles, ornate arches, rooftop terrace with Atlas views, hammam and sauna",
            "neighborhood": "Authentic heart of the Red City",
            "investment": "High potential for luxury guesthouse or boutique hotel"
        },
        {
            "intent": "Sale",
            "title": "Grand Mansion Marrakech Palace",
            "type": "Luxury Mansion",
            "location": "Exclusive Gated District, Marrakech",
            "price": "205,200,000 MAD",
            "plot_size": "31,000 m2",
            "built_size": "2,500 m2",
            "bedrooms": 23,
            "bathrooms": 32,
            "staff_rooms": "Large staff wing with multiple suites",
            "parking": "700 m2 private parking area",
            "security": "High-level private security, 24/7 guarded",
            "garden_details": "3 hectares of landscaped botanical gardens",
            "distance_center": "10 minutes to the Golden Triangle",
            "accessibility": "Private helipad and wide paved roads",
            "features": "Majestic ground floor, opulent suites, multiple private pools, built in 2015",
            "neighborhood": "The most prestigious and private neighborhood in Marrakech",
            "investment": "Ultra-rare asset for institutional investors or royal families"
        },
        {
            "intent": "Sale",
            "title": "Luxury Villa Route de Fès",
            "type": "Luxury Villa",
            "location": "Route de Fès, Marrakech",
            "price": "25,000,000 MAD",
            "plot_size": "25,800 m2",
            "built_size": "685 m2",
            "bedrooms": 6,
            "bathrooms": 10,
            "staff_rooms": "Independent staff quarters",
            "parking": "Multiple car garage",
            "security": "Fully fenced with CCTV",
            "garden_details": "Vast garden with 11x4.5m infinity pool",
            "distance_center": "15 minutes to center",
            "accessibility": "Direct access from Casablanca road",
            "features": "Fireplace, grand reception area, southern exposure with breathtaking views",
            "neighborhood": "Calm residential zone near Amelkis Golf Course",
            "investment": "Strong capital appreciation potential in a booming area"
        },
        {
            "intent": "Sale",
            "title": "Villa Jade Janat Zaitoun",
            "type": "Luxury Villa",
            "location": "Janat Zaitoun, Casablanca Road",
            "price": "3,600,000 MAD",
            "plot_size": "358 m2",
            "built_size": "350 m2",
            "bedrooms": 4,
            "bathrooms": 3,
            "staff_rooms": "1 maid room",
            "parking": "Secure parking",
            "security": "24/7 Gated community",
            "garden_details": "Landscaped green spaces",
            "distance_center": "12 minutes to downtown",
            "accessibility": "Direct paved road access",
            "features": "Modern design, master suite, semi-finished allowing customization, pool and gym access",
            "neighborhood": "Secure high-end residence with tennis courts",
            "investment": "Perfect for families seeking a modern primary residence"
        }
    ]

    print(f"Initialisation du 'Seeding' de {len(properties_list)} biens réels...")

    for data in properties_list:
        try:
            # 1. Création de la propriété
            new_id = uuid.uuid4()
            new_prop = Property(
                id=new_id,
                title=data['title'],
                type=data['type'],
                location=data['location'],
                # On convertit le prix texte en nombre pour la base
                price=float(data['price'].replace(' MAD', '').replace(',', '')),
                area_sqm=int(data['built_size'].replace(' m2', '').replace(',', '')),
                bedrooms=data['bedrooms'],
                description=data['features']
            )
            db.add(new_prop)
            db.commit()
            db.refresh(new_prop)
            print(f"✅ Bien inséré : {data['title']}")

            # 2. Génération de l'article SEO expert
            print(f" L'IA génère l'article expert (anglais) pour {data['title']}...")
            article_content = generator.generate_seo_article(data, "English")

            # 3. Sauvegarde dans le Cache
            new_cache = AIContentCache(
                property_id=new_id,
                language="en",
                article_body=article_content,
                seo_title=f"Luxury {data['type']} for Sale in {data['location']}"
            )
            db.add(new_cache)
            db.commit()
            print(f"Article sauvegardé en base de données.")

        except Exception as e:
            print(f"Erreur sur {data['title']} : {e}")
            db.rollback()

    db.close()
    print("\n Opération terminée. Votre base de données Cloud est prête !")

if __name__ == "__main__":
    seed_real_estate_data()