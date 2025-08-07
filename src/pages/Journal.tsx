import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

import article1 from '@/assets/article-1.jpg';
import article2 from '@/assets/article-2.jpg';
import article3 from '@/assets/article-3.jpg';
import article5 from '@/assets/article-5.jpg';
import article6 from '@/assets/article-6.jpg';
import article7 from '@/assets/article-7.jpg';


const Journal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const articles = [
    {
      id: 1,
      title: "10 Tips for First-Time Home Buyers in 2024",
      excerpt: "Navigate the home buying process with confidence using these expert tips tailored for today's market conditions. From pre-approval to closing, we cover everything you need to know.",
      category: "Buying Guide",
      author: "Sarah Mitchell",
      date: "2024-01-15",
      readTime: "5 min read",
      image: article1,
      featured: true,
      tags: ["first-time-buyer", "tips", "mortgage", "home-buying"]
    },
    {
      id: 2,
      title: "Real Estate Market Trends: What to Expect This Year",
      excerpt: "Discover the latest market insights and predictions that will shape the real estate landscape in the coming months. Our analysis covers pricing trends, inventory levels, and regional variations.",
      category: "Market Analysis",
      author: "Michael Chen",
      date: "2024-01-12",
      readTime: "7 min read",
      image: article2,
      featured: false,
      tags: ["market-trends", "analysis", "investment", "2024"]
    },
    {
      id: 3,
      title: "Staging Your Home: Secrets from Interior Designers",
      excerpt: "Learn professional staging techniques that can increase your home's value and appeal to potential buyers. From decluttering to color schemes, master the art of presentation.",
      category: "Selling Tips",
      author: "Emily Rodriguez",
      date: "2024-01-10",
      readTime: "6 min read",
      image: article3,
      featured: true,
      tags: ["staging", "interior-design", "selling", "home-value"]
    },
    {
      id: 4,
      title: "Investment Properties: Building Long-Term Wealth",
      excerpt: "Explore the fundamentals of real estate investing and learn how to build a profitable property portfolio. We discuss cash flow, appreciation, and tax benefits.",
      category: "Investment",
      author: "David Thompson",
      date: "2024-01-08",
      readTime: "8 min read",
      image: article5,
      featured: false,
      tags: ["investment", "wealth-building", "cash-flow", "portfolio"]
    },
    {
      id: 5,
      title: "Sustainable Living: Eco-Friendly Home Features",
      excerpt: "Discover how green home features can reduce your environmental impact while saving money. From solar panels to smart thermostats, explore sustainable living options.",
      category: "Lifestyle",
      author: "Lisa Wang",
      date: "2024-01-05",
      readTime: "5 min read",
      image: article6,
      featured: false,
      tags: ["sustainability", "eco-friendly", "green-homes", "energy-efficiency"]
    },
    {
      id: 6,
      title: "Luxury Real Estate: Understanding the Premium Market",
      excerpt: "Dive into the world of luxury real estate and understand what drives this exclusive market segment. Learn about unique selling points and buyer expectations.",
      category: "Luxury",
      author: "Alexander GateOne",
      date: "2024-01-03",
      readTime: "6 min read",
      image: article7,
      featured: true,
      tags: ["luxury", "premium-market", "high-end", "exclusive"]
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Buying Guide', label: 'Buying Guide' },
    { value: 'Market Analysis', label: 'Market Analysis' },
    { value: 'Selling Tips', label: 'Selling Tips' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Lifestyle', label: 'Lifestyle' },
    { value: 'Luxury', label: 'Luxury' },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = articles.filter(article => article.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChatBot />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-primary mb-6">
            Real Estate Journal
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay informed with expert insights, market trends, and valuable tips from the world of real estate
          </p>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-primary mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.slice(0, 3).map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                    Featured
                  </Badge>
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">{article.category}</Badge>
                  <h3 className="text-xl font-playfair font-semibold text-primary mb-3 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(article.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <Link to={`/article/${article.id}`}>
                    <Button className="w-full btn-primary">Read Article</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-muted/30 border-y border-border">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-primary mb-8">All Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    {article.featured && (
                      <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                    )}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-playfair font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(article.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <Link to={`/article/${article.id}`}>
                    <Button variant="outline" className="w-full">Read Article</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No articles found matching your search criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Load More */}
          {filteredArticles.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Articles
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Journal;