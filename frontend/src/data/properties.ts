import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';
import property4 from '@/assets/property-4.jpg';
import property5 from '@/assets/property-5.jpg';
import property6 from '@/assets/property-6.jpg';

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
    title: "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm",
    type: "Riad",
    price: 690000,
    location: "Historic medina",
    bedrooms: 4,
    bathrooms: 4,
    area: 335,
    image: property1,
    featured: true,
    description: "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm. The location of this riad in Morocco places you at the center of cultural and historical attractions. The medina is home to bustling souks, artisan workshops, historic sites, and authentic Moroccan cuisine. It's a short walk to major landmarks, making this a top choice for both lifestyle buyers and short-term rental guests.",
    yearBuilt: 2018,
    garage: 0,
    status: "For Sale"
  },
  {
    id: 2,
    title: "Amelkis Golf Villa – For Living or Investment",
    type: "Villa",
    price: 2500000,
    location: "Amelkis Golf Domain, Marrakech",
    bedrooms: 4,
    bathrooms: 6,
    area: 685,
    image: property2,
    featured: false,
    description: "This luxury villa in Amelkis Golf Domain, Marrakech, offers 685 m² of elegant living space, blending Moroccan charm with contemporary finishes. With 4 bedrooms, 6 bathrooms, a private pool, and landscaped gardens, it's perfect for a serene family home or a high-end investment. Located in a secure, prestigious golf resort just 10 minutes from downtown, it provides both exclusivity and accessibility. Ideal for relocation, second home ownership, or a premium holiday rental opportunity.",
    yearBuilt: 2020,
    garage: 2,
    status: "For Sale"
  },
];