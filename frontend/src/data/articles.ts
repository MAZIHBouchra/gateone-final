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
    title: "Marrakech Real Estate Market in 2025 – Key Trends for Investors",
    excerpt: "The Marrakech real estate market in 2025 shows stable growth, driven by economic expansion, tourism, and shifting buyer preferences toward spacious, eco-friendly homes. With opportunities ranging from luxury villas and traditional riads to modern apartments in emerging neighborhoods, the market offers diverse investment potential supported by infrastructure improvements and increasing digitization.",
    category: "Investment Trends",
    author: "Sarah Mitchell",
    date: "2025-08-06",
    readTime: "5 min read",
    image: article1,
    featured: true,
    tags: ["Marrakech real estate 2025", "tips", "mortgage", "home-buying"]
  },
  {
    id: 2,
    title: "Effective Strategies to Market Your Marrakech Property to International Buyers and Renters",
    excerpt: "Discover the latest market insights and predictions that will shape the real estate landscape in the coming months. Our analysis covers pricing trends, inventory levels, and regional variations.",
    category: "Market Analysis",
    author: "Michael Chen",
    date: "2025-07-31",
    readTime: "6 min read",
    image: article2,
    featured: false,
    tags: ["market-trends", "analysis", "investment", "2025"]
  },
  {
    id: 3,
    title: "Apartments vs Luxury Villas Marrakech: Which Is the Best Real Estate Investment?",
    excerpt: "This guide compares the investment potential of apartments versus luxury villas in Marrakech, helping investors choose based on budget, rental income, and long-term growth.",
    category: "Investment Tips",
    author: "Emily Rodriguez",
    date: "2025-07-29",
    readTime: "6 min read",
    image: article3,
    featured: true,
    tags: ["Apartment", "interior-design", "Villa", "home-value"]
  },
  {
    id: 4,
    title: "Who Owns Marrakech?",
    excerpt: "Explores how Marrakech's real estate landscape has shifted due to rising foreign investment, transforming ownership, prices, and the city's socio-economic fabric",
    category: "Investment",
    author: "David Thompson",
    date: "2025-07-25",
    readTime: "8 min read",
    image: article5,
    featured: false,
    tags: ["investment", "Marrakech", "Transformation", "Economy"]
  },
  {
    id: 5,
    title: "Investing in Real Estate Near Morocco Mall Marrakech",
    excerpt: "Investing in real estate near Morocco Mall Marrakech offers strategic location benefits, rising residential and commercial demand, and strong long-term value potential.",
    category: "Lifestyle",
    author: "Lisa Park",
    date: "2025-07-25",
    readTime: "5 min read",
    image: article6,
    featured: false,
    tags: ["High-demand", "Marrakech", "Benefits", "Investment"]
  },
  {
    id: 6,
    title: "Common Myths About Buying Property in Marrakech Debunked",
    excerpt: "This article debunks common myths about buying property in Marrakech, emphasizing that foreigners have equal rights and that the process can be secure and straightforward with expert guidance.",
    category: "Luxury",
    author: "Ahmed Hassan",
    date: "2025-07-23",
    readTime: "6 min read",
    image: article7,
    featured: true,
    tags: ["luxury", "premium-market", "high-end", "Investment"]
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