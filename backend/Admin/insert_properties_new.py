from pymongo import MongoClient
from datetime import datetime
from config import MONGO_URI, DATABASE_NAME


def insert_properties():
    # Connexion à MongoDB Atlas
    client = MongoClient(MONGO_URI)

    # Choisir la base de données et la collection
    db = client[DATABASE_NAME]
    properties_collection = db.properties

    # Supprimer les propriétés existantes pour éviter les doublons
    properties_collection.delete_many({})

    # Liste complète des propriétés à insérer
    properties = [
        {
            "id": 1,
            "title": "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm",
            "type": "Riad",
            "price": 690000,
            "location": "Historic medina, Marrakech",
            "bedrooms": 4,
            "bathrooms": 4,
            "area": 335,
            "status": "For Sale",
            "featured": True,
            "description": "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm. The location of this riad in Morocco places you at the center of cultural and historical attractions. The medina is home to bustling souks, artisan workshops, historic sites, and authentic Moroccan cuisine. It's a short walk to major landmarks, making this a top choice for both lifestyle buyers and short-term rental guests.",
            "image": "/images/property-1.jpg",
            "images": ["/images/property-1.jpg", "/images/property-11.jpg", "/images/property-111.jpg"],
            "features": [
                "Authentic Moroccan Design (zellige tiles, tadelakt walls, carved cedar wood)",
                "4 Floors + Rooftop Terrace",
                "Rooftop Terrace with Medina Views (ideal for dining, sunbathing, entertaining)",
                "Prime Location in Historic Medina",
                "Investment Opportunity (guesthouse, Airbnb, vacation rental)",
                "Modern Comforts Integrated with Traditional Style",
                "Close to Cultural & Historical Attractions",
                "High-Quality Craftsmanship and Finishes",
                "Photo Gallery and Tours Available on Request"
            ],
            "yearBuilt": 2018,
            "garage": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 2,
            "title": "Amelkis Golf Villa – For Living or Investment",
            "type": "Villa",
            "price": 2500000,
            "location": "Amelkis Golf Domain, Marrakech",
            "bedrooms": 4,
            "bathrooms": 6,
            "area": 685,
            "status": "For Sale",
            "featured": False,
            "description": "This luxury villa in Amelkis Golf Domain, Marrakech, offers 685 m² of elegant living space, blending Moroccan charm with contemporary finishes. With 4 bedrooms, 6 bathrooms, a private pool, and landscaped gardens, it's perfect for a serene family home or a high-end investment. Located in a secure, prestigious golf resort just 10 minutes from downtown, it provides both exclusivity and accessibility. Ideal for relocation, second home ownership, or a premium holiday rental opportunity.",
            "image": "/images/property-2.jpg",
            "images": ["/images/property-2.jpg", "/images/property-222.jpg", "/images/property-22.jpg"],
            "features": [
                "Located in the prestigious Amelkis Golf Domain, Marrakech",
                "685 m² of elegant living space",
                "4 spacious and beautifully finished bedrooms",
                "6 luxurious bathrooms including guest and service facilities",
                "Private swimming pool surrounded by lush greenery",
                "Landscaped garden with multiple outdoor lounge areas",
                "Flooded with natural light through floor-to-ceiling windows",
                "High ceilings and panoramic garden and golf course views",
                "Expansive rooftop terrace for relaxing or entertaining",
                "Multiple outdoor terraces for dining and leisure",
                "Traditional Moroccan design blended with modern finishes",
                "Situated within a gated community with 24/7 security",
                "Direct access to golf course, spa, and fine dining",
                "10 minutes from downtown Marrakech",
                "Ideal for personal residence, second home, or rental investment"
            ],
            "yearBuilt": 2020,
            "garage": 2,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 3,
            "title": "Modern Suburban Home in Beverly Hills",
            "type": "House",
            "price": 1250000,
            "location": "Beverly Hills, CA",
            "bedrooms": 4,
            "bathrooms": 3,
            "area": 2800,
            "status": "For Sale",
            "featured": True,
            "description": "Discover this magnificent suburban home in the prestigious Beverly Hills area. This elegant property combines classic architecture with modern amenities, featuring spacious rooms, a beautiful garden, and a swimming pool. Perfect for families seeking luxury and comfort in a prime location.",
            "image": "/images/property-3.jpg",
            "images": ["/images/property-3.jpg", "/images/property-33.jpg", "/images/property-333.jpg"],
            "features": [
                "Spacious open-plan living areas",
                "Swimming pool and outdoor entertainment area",
                "Two-car garage with additional storage",
                "Beautifully landscaped garden",
                "High-end kitchen with granite countertops",
                "Master suite with walk-in closet",
                "Home office/study room",
                "Premium security system",
                "Close to top-rated schools"
            ],
            "yearBuilt": 2019,
            "garage": 2,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 4,
            "title": "Waterfront Penthouse with Panoramic Views",
            "type": "Penthouse",
            "price": 3200000,
            "location": "Seattle, WA",
            "bedrooms": 3,
            "bathrooms": 3,
            "area": 2200,
            "status": "For Sale",
            "featured": True,
            "description": "Exceptional waterfront penthouse offering panoramic views of the Puget Sound and city skyline. This luxury residence features an open-concept design, premium finishes, and a private terrace perfect for entertaining. Located in Seattle's most desirable waterfront district.",
            "image": "/images/property-4.jpg",
            "images": ["/images/property-4.jpg", "/images/property-44.jpg", "/images/property-444.jpg"],
            "features": [
                "Panoramic water and city views",
                "Private elevator access",
                "Wraparound terrace with outdoor kitchen",
                "Floor-to-ceiling windows throughout",
                "Premium Viking appliances",
                "Master suite with spa-like bathroom",
                "Smart home automation system",
                "Concierge and valet services",
                "Marina access and boat slip available"
            ],
            "yearBuilt": 2021,
            "garage": 1,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 5,
            "title": "Cozy Garden Cottage in Portland",
            "type": "Cottage",
            "price": 680000,
            "location": "Portland, OR",
            "bedrooms": 3,
            "bathrooms": 2,
            "area": 1800,
            "status": "For Sale",
            "featured": False,
            "description": "Charming garden cottage nestled in Portland's vibrant neighborhood. This cozy home features original hardwood floors, a fireplace, and a beautiful garden sanctuary. Perfect for those seeking character and charm in a peaceful setting while staying close to the city's amenities.",
            "image": "/images/property-5.jpg",
            "images": ["/images/property-5.jpg", "/images/property-55.jpg", "/images/property-555.jpg"],
            "features": [
                "Original hardwood floors throughout",
                "Cozy fireplace in living room",
                "Beautiful garden with mature trees",
                "Updated kitchen with vintage charm",
                "Covered front porch",
                "Detached garage and workshop",
                "Walking distance to local cafes and shops",
                "Quiet residential neighborhood",
                "Energy-efficient windows and insulation"
            ],
            "yearBuilt": 2005,
            "garage": 1,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 6,
            "title": "Contemporary Loft in Arts District",
            "type": "Loft",
            "price": 950000,
            "location": "Chicago, IL",
            "bedrooms": 2,
            "bathrooms": 2,
            "area": 1500,
            "status": "For Sale",
            "featured": False,
            "description": "Stunning contemporary loft in Chicago's trendy arts district. This industrial-chic space features exposed brick walls, soaring ceilings, and large windows that flood the space with natural light. Perfect for those who appreciate modern design and urban living.",
            "image": "/images/property-6.jpg",
            "images": ["/images/property-6.jpg", "/images/property-66.jpg", "/images/property-666.jpg"],
            "features": [
                "Exposed brick walls and steel beams",
                "Soaring 14-foot ceilings",
                "Industrial-style kitchen with island",
                "Polished concrete floors",
                "Large windows with city views",
                "In-unit laundry",
                "Building amenities: rooftop deck, gym",
                "Walking distance to galleries and restaurants",
                "Secure building with elevator"
            ],
            "yearBuilt": 2015,
            "garage": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 7,
            "title": "Luxury Apartment Downtown Manhattan",
            "type": "Apartment",
            "price": 850000,
            "location": "New York, NY",
            "bedrooms": 2,
            "bathrooms": 2,
            "area": 1200,
            "status": "For Sale",
            "featured": True,
            "description": "Sophisticated apartment in the heart of Manhattan with stunning city views and premium amenities. Features modern finishes, high-end appliances, and access to building facilities including gym, pool, and concierge service.",
            "image": "/images/property-7.jpg",
            "images": ["/images/property-7.jpg", "/images/property-77.jpg", "/images/property-777.jpg"],
            "features": [
                "Prime Manhattan location",
                "City skyline views",
                "High-end kitchen appliances",
                "Hardwood floors throughout",
                "Floor-to-ceiling windows",
                "24/7 concierge service",
                "Building gym and pool",
                "Rooftop terrace access",
                "Close to subway stations"
            ],
            "yearBuilt": 2018,
            "garage": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 8,
            "title": "Mountain View Villa in Aspen",
            "type": "Villa",
            "price": 1800000,
            "location": "Aspen, CO",
            "bedrooms": 5,
            "bathrooms": 4,
            "area": 3500,
            "status": "For Sale",
            "featured": False,
            "description": "Stunning mountain villa with breathtaking views and luxury amenities. Perfect for those seeking a retreat in one of Colorado's most prestigious locations. Features include a stone fireplace, gourmet kitchen, and expansive outdoor spaces.",
            "image": "/images/property-8.jpg",
            "images": ["/images/property-8.jpg", "/images/property-88.jpg", "/images/property-888.jpg"],
            "features": [
                "Breathtaking mountain views",
                "Stone fireplace and vaulted ceilings",
                "Gourmet kitchen with granite counters",
                "Master suite with mountain views",
                "Hot tub and outdoor entertainment area",
                "Three-car garage",
                "Ski-in/ski-out access",
                "Premium location in Aspen",
                "Mature landscaping"
            ],
            "yearBuilt": 2017,
            "garage": 3,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

    # Insérer toutes les propriétés
    properties_collection.insert_many(properties)
    print(f"✅ {len(properties)} propriétés insérées avec succès!")


if __name__ == "__main__":
    insert_properties()
