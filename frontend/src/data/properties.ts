import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';

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
  }
];