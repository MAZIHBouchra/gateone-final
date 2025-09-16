import article1 from '@/assets/article-1.jpg';
import article2 from '@/assets/article-2.jpg';
import article3 from '@/assets/article-3.jpg';
import article5 from '@/assets/article-5.jpg';
import article6 from '@/assets/article-6.jpg';
import article7 from '@/assets/article-7.jpg';

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author?: string;
  date: string;
  readTime: string;
  image: string;
  featured: boolean;
  tags: string[];
}

export const articles: Article[] = [
  {
    id: 1,
    title: "Marrakech Real Estate Market in 2025: A Dynamic Investment Destination",
    excerpt: "The Marrakech Real Estate Market in 2025 is expected to be one of Morocco’s most attractive sectors for investors, driven by economic growth, urbanization, tourism, and evolving buyer preferences. From luxury villas and traditional riads to modern apartments, Marrakech offers diverse opportunities balancing tradition and modernity.",
    category: "Investment Trends",
    date: "2025-08-06",
    readTime: "6 min read",
    image: article1,
    featured: true,
    tags: ["Marrakech real estate 2025", "investment", "villas", "riads", "apartments", "trends"]
  },
  {
    id: 2,
    title: "Luxury Villas vs Apartments: Which Is the Better Investment?",
    excerpt: "In Marrakech’s thriving real estate market, the choice between luxury villas and modern apartments is a top concern for investors. Villas offer prestige, capital appreciation, and premium rental yields, while apartments provide affordability, steady demand, and lower maintenance costs.",
    category: "Market Analysis",
    date: "2025-07-31",
    readTime: "6 min read",
    image: article2,
    featured: false,
    tags: ["Marrakech real estate 2025", "luxury villas", "apartments", "investment", "rental income", "property market"]
  },
  {
    id: 3,
    title: "Buying Property in Marrakech: Myths vs Reality",
    excerpt: "Buying property in Marrakech is often surrounded by myths, from supposed restrictions on foreigners to concerns about security and pricing. In reality, Morocco’s laws protect buyers and offer clear processes for safe and profitable investments.",
    category: "Investment Tips",
    date: "2025-07-29",
    readTime: "6 min read",
    image: article3,
    featured: true,
    tags: ["Marrakech property", "real estate myths", "foreign buyers", "investment tips", "property laws"]
  }
];

export const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Buying Guide', label: 'Buying Guide' },
  { value: 'Market Analysis', label: 'Market Analysis' },
  { value: 'Investment Tips', label: 'Investment Tips' },
  { value: 'Investment Trends', label: 'Investment Trends' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Lifestyle', label: 'Lifestyle' },
  { value: 'Luxury', label: 'Luxury' },
];