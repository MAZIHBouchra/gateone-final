import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/P3.jpg';
import property4 from '@/assets/P4.jpg';
import property5 from '@/assets/p5.jpg';
export interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  featured: boolean;
  description: string;
  yearBuilt?: number;
  garage?: number;
  status: string;
}

export const properties: Property[] = [
  {
    id: 1,
    title: "Luxury Apartment for Sale in Marrakech – Spacious 147 m² with Terraces and Parking",
    type: "Apartment",
    price: 3000000, // MAD (furnished)
    location: "Calm residential zone, Marrakech",
    bedrooms: 3, // 2 chambres + 1 suite parentale
    bathrooms: 2,
    area: 147,
    image: property1, // remplace par l’image réelle
    featured: true,
    description: "This luxury apartment for sale in Marrakech offers 147 m² of refined living space with two bright bedrooms and a spacious master suite. It includes two private terraces (25 m² and 15 m²), a secure underground parking space, and elegant modern finishes. Located in a peaceful residential area yet close to the city’s main attractions, it combines comfort, exclusivity, and strong investment potential.",
    yearBuilt: 2020, // à ajuster selon la vraie date
    garage: 1,
    status: "For Sale"
  },
  {
    id: 2,
    title: "Luxury Villa Rental in Marrakech: Modern Targa Retreat",
    type: "Villa",
    price: 35000, // DH / month (loyer mensuel)
    location: "Targa, Marrakech",
    bedrooms: 4, // 3 suites + 1 chambre invités
    bathrooms: 5, // 3 salles de bain + 1 invités + 1 staff (ajustable selon infos)
    area: 400, // estimation car la surface n’était pas précisée (tu peux corriger)
    image: property2, // à remplacer par l’image correspondante
    featured: false,
    description: "This modern villa rental in Targa, Marrakech, offers spacious interiors with 3 suites, a guest bedroom, a double living room with fireplace, and a fully equipped modern kitchen. It features a landscaped garden, a private swimming pool, and outdoor lounge areas for entertaining or relaxation. Located just minutes from Jardin Majorelle and Lycée Victor Hugo, this villa combines tranquility, security, and quick access to Marrakech’s main attractions. Perfect for families, professionals, or expatriates seeking comfort, elegance, and a premium lifestyle.",
    yearBuilt: 2021, // estimation (à ajuster)
    garage: 2,
    status: "For Rent"
  },
{
  id: 3,
  title: "Luxury Property with VNA for Sale in Marrakech – Rare 4-Hectare Estate with Villa & Pool",
  type: "Villa",
  price: 1460000, // € pour la villa + 1 hectare (net seller)
  location: "Marrakech, Morocco",
  bedrooms: 4, // estimation basée sur la villa 400 m²
  bathrooms: 5, // estimation (peut inclure suites et invités)
  area: 400, // hectares totaux
  image: property3, // à remplacer par l’image correspondante
  featured: true,
  description: "This exceptional luxury property in Marrakech spans 4 hectares, subdivided into four 1-hectare lots, featuring a 400 m² villa, a 20-meter swimming pool, and secured VNA (Vocation Non Agricole) authorization. The villa offers spacious, luminous interiors with multiple terraces, ideal for families or hospitality projects. With full administrative clarity, including titles and permits, this estate provides both lifestyle comfort and strategic real estate investment potential.",
  yearBuilt: 2020, // estimation
  garage: 2, 
  status: "For Sale",
},
{
  id: 4,
  title: "Luxury Villas for Sale on RCZ Road, Marrakech: Exclusive Dual-Villa Estate",
  type: "Villa",
  price: 4200000, // € pour les deux villas (≈ 45,000,000 MAD)
  location: "RCZ Road, Marrakech, Morocco",
  bedrooms: 10, // 4 suites villa 1 + 6 suites villa 2
  bathrooms: 10, // estimation selon suites et salles invités
  area: 1000,  // 9,000 m² ≈ 0.9 hectares
  image: property4, // à remplacer par l’image correspondante
  featured: true,
  description: "This rare dual-villa estate on RCZ Road, Marrakech, spans 9,000 m² and includes two independent luxury villas, landscaped gardens, wellness facilities, and premium leisure amenities. Designed for privacy, comfort, and long-term value, the property offers elegance, sustainable outdoor spaces, and investment potential.",
  yearBuilt: 2022, // estimation
  garage: 5, // garage pour 3–5 voitures
  status: "For Sale",
}
{
  id: 5,
  title: "Apartment for Sale in Marrakech – Luxury 118m² Flat on Boulevard Abdelkarim El Khatabi",
  type: "Apartment",
  price: 2200000, // MAD – prix meublé
  location: "Boulevard Abdelkarim El Khatabi, Marrakech, Morocco",
  bedrooms: 2, // Master suite + second bedroom
  bathrooms: 2, // estimation selon les suites
  area: 118, // superficie en m²
  image: property5, // à remplacer par l’image correspondante
  featured: true,
  description: "This luxury 118 m² apartment in Marrakech’s hotel district on Boulevard Abdelkarim El Khatabi offers modern design, multiple balconies, and exclusive amenities. Located in a secure residential complex with pool, underground parking, and 24/7 security, it is ideal for families, professionals, and investors seeking comfort, style, and high investment potential.",
  yearBuilt: 2021, // estimation
  garage: 1, // parking souterrain
  status: "For Sale",
}

]