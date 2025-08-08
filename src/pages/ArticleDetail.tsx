import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Share, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

const ArticleDetail = () => {
  const { id } = useParams();

  // Article data based on ID
  const articlesData = {
    1: {
      title: "10 Tips for First-Time Home Buyers in 2024",
      excerpt: "Navigate the home buying process with confidence using these expert tips tailored for today's market conditions.",
      category: "Buying Guide",
      author: "Sarah Mitchell",
      authorBio: "Sarah is a senior real estate agent with over 10 years of experience helping first-time buyers navigate the market.",
      authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      date: "2024-01-15",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      tags: ["first-time-buyer", "tips", "mortgage", "home-buying"],
      content: `
        <p>Buying your first home is one of life's most significant milestones, but it can also feel overwhelming. The real estate market has evolved considerably, especially in recent years, and first-time buyers need to be well-prepared to navigate today's competitive landscape successfully.</p>
        <h2>1. Get Pre-Approved for a Mortgage</h2>
        <p>Before you start house hunting, it's crucial to understand exactly how much you can afford. Getting pre-approved for a mortgage gives you a clear budget and shows sellers that you're a serious buyer.</p>
        <h2>2. Research Neighborhoods Thoroughly</h2>
        <p>Don't just focus on the house itself – the neighborhood is equally important. Consider factors like commute times, school districts, local amenities, and future development plans.</p>
        <h2>3. Work with a Qualified Real Estate Agent</h2>
        <p>A good real estate agent is invaluable for first-time buyers. They can guide you through the process, help you understand market conditions, and negotiate on your behalf.</p>
      `,
    },
    2: {
      title: "Real Estate Market Trends: What to Expect This Year",
      excerpt: "Discover the latest market insights and predictions that will shape the real estate landscape in the coming months.",
      category: "Market Analysis",
      author: "Michael Chen",
      authorBio: "Michael is a market analyst with 15 years of experience tracking real estate trends and economic indicators.",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      date: "2024-01-12",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      tags: ["market-trends", "analysis", "investment", "2024"],
      content: `
        <p>The real estate market continues to evolve rapidly, influenced by economic factors, demographic shifts, and changing consumer preferences. Understanding these trends is crucial for both buyers and sellers in making informed decisions.</p>
        <h2>Interest Rate Projections</h2>
        <p>Interest rates have been a major factor affecting housing affordability. Current projections suggest rates may stabilize in the coming months, potentially opening opportunities for buyers who have been waiting on the sidelines.</p>
        <h2>Inventory Levels and Supply Chain</h2>
        <p>Housing inventory remains a critical factor in many markets. New construction is gradually increasing, but supply chain improvements and labor availability continue to impact delivery timelines.</p>
        <h2>Regional Market Variations</h2>
        <p>Different regions are experiencing varying market conditions. Urban areas are seeing renewed interest as remote work policies evolve, while suburban markets continue to show strength.</p>
      `,
    },
    3: {
      title: "Staging Your Home: Secrets from Interior Designers",
      excerpt: "Learn professional staging techniques that can increase your home's value and appeal to potential buyers.",
      category: "Selling Tips",
      author: "Emily Rodriguez",
      authorBio: "Emily is a certified interior designer and home staging expert with over 12 years of experience transforming spaces.",
      authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      date: "2024-01-10",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      tags: ["staging", "interior-design", "selling", "home-value"],
      content: `
        <p>Professional home staging can significantly impact how quickly your home sells and for how much. The right staging creates an emotional connection with buyers and helps them envision themselves living in the space.</p>
        <h2>Declutter and Depersonalize</h2>
        <p>The first step in staging is removing personal items and excess clutter. This allows potential buyers to imagine their own belongings in the space and reduces distractions.</p>
        <h2>Neutral Color Palette</h2>
        <p>Fresh paint in neutral colors can make rooms feel larger and cleaner. Stick to whites, grays, and beiges that appeal to the broadest range of buyers.</p>
        <h2>Strategic Furniture Placement</h2>
        <p>Proper furniture arrangement can make rooms appear larger and highlight their best features. Sometimes less is more – removing oversized pieces can open up a space dramatically.</p>
        <h2>Lighting and Ambiance</h2>
        <p>Good lighting is crucial for creating a warm, welcoming atmosphere. Ensure all fixtures work, add lamps for warmth, and open curtains to maximize natural light.</p>
      `,
    },
    4: {
      title: "Investment Properties: Building Long-Term Wealth",
      excerpt: "Explore the fundamentals of real estate investing and learn how to build a profitable property portfolio.",
      category: "Investment",
      author: "David Thompson",
      authorBio: "David is a real estate investment advisor and portfolio manager with expertise in commercial and residential properties.",
      authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      date: "2024-01-08",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      tags: ["investment", "wealth-building", "cash-flow", "portfolio"],
      content: `
        <p>Real estate investing can be one of the most effective ways to build long-term wealth, but it requires careful planning, market knowledge, and strategic thinking to be successful.</p>
        <h2>Understanding Cash Flow</h2>
        <p>Positive cash flow occurs when rental income exceeds all expenses including mortgage payments, taxes, insurance, and maintenance. This is the foundation of successful real estate investing.</p>
        <h2>Location Analysis</h2>
        <p>The old saying "location, location, location" is especially true for investment properties. Look for areas with growing employment, good schools, and planned infrastructure improvements.</p>
        <h2>Financing Strategies</h2>
        <p>Investment property financing differs from owner-occupied homes. Understand your options including conventional loans, portfolio lenders, and creative financing methods.</p>
        <h2>Property Management</h2>
        <p>Decide whether to self-manage or hire a property management company. Consider your time availability, local knowledge, and the complexity of managing multiple properties.</p>
      `,
    },
    5: {
      title: "Sustainable Living: Eco-Friendly Home Features",
      excerpt: "Discover how green home features can reduce your environmental impact while saving money.",
      category: "Lifestyle",
      author: "Lisa Wang",
      authorBio: "Lisa is a sustainability consultant and green building specialist passionate about eco-friendly living solutions.",
      authorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      date: "2024-01-05",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      tags: ["sustainability", "eco-friendly", "green-homes", "energy-efficiency"],
      content: `
        <p>Sustainable living is becoming increasingly important as homeowners seek to reduce their environmental footprint while enjoying long-term cost savings through energy efficiency.</p>
        <h2>Solar Energy Systems</h2>
        <p>Solar panels have become more affordable and efficient, offering significant long-term savings on electricity bills while reducing reliance on fossil fuels.</p>
        <h2>Smart Home Technology</h2>
        <p>Smart thermostats, LED lighting, and energy monitoring systems help optimize energy usage and provide real-time feedback on consumption patterns.</p>
        <h2>Water Conservation</h2>
        <p>Low-flow fixtures, rainwater harvesting systems, and drought-resistant landscaping can significantly reduce water usage and utility costs.</p>
        <h2>Sustainable Materials</h2>
        <p>Choose building materials with low environmental impact, such as bamboo flooring, recycled content insulation, and low-VOC paints and finishes.</p>
      `,
    },
    6: {
      title: "Luxury Real Estate: Understanding the Premium Market",
      excerpt: "Dive into the world of luxury real estate and understand what drives this exclusive market segment.",
      category: "Luxury",
      author: "Alexander GateOne",
      authorBio: "Alexander is a luxury real estate specialist with extensive experience in high-end properties and exclusive markets.",
      authorImage: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      date: "2024-01-03",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      tags: ["luxury", "premium-market", "high-end", "exclusive"],
      content: `
        <p>The luxury real estate market operates by different rules than traditional residential sales, with unique buyer motivations, marketing strategies, and transaction processes.</p>
        <h2>Defining Luxury</h2>
        <p>Luxury real estate isn't just about price – it encompasses exceptional location, architectural significance, premium amenities, and exclusive features that set properties apart.</p>
        <h2>Buyer Psychology</h2>
        <p>Luxury buyers often prioritize lifestyle, prestige, and investment potential over basic functionality. They seek properties that reflect their success and provide unique experiences.</p>
        <h2>Marketing Strategies</h2>
        <p>Marketing luxury properties requires sophisticated approaches including private showings, exclusive events, international exposure, and partnerships with luxury brands.</p>
        <h2>Global Market Trends</h2>
        <p>The luxury market is increasingly global, with international buyers seeking trophy properties in prestigious locations worldwide.</p>
      `,
    },
  };

  const articleId = parseInt(id || '1');
  const article = articlesData[articleId as keyof typeof articlesData] || articlesData[1];
  
  const articleWithId = {
    ...article,
    id: articleId,
    featured: articleId === 1 || articleId === 3 || articleId === 6,
  };

  const relatedArticles = [
    {
      id: 2,
      title: "Understanding Mortgage Types and Requirements",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Financing"
    },
    {
      id: 3,
      title: "Home Inspection Checklist: What to Look For",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Buying Guide"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChatBot />
      
      <div className="pt-20">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
          <div className="absolute bottom-8 left-0 right-0">
            <div className="container-custom">
              <Badge className="bg-accent text-accent-foreground mb-4">{article.category}</Badge>
              <h1 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-4 max-w-4xl">
                {article.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <section className="section-padding">
          <div className="container-custom max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(article.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center ml-auto gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Article Text */}
                 <div 
                  className="prose prose-lg max-w-none text-foreground
                    prose-headings:font-playfair prose-headings:text-primary
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:leading-relaxed prose-p:mb-6
                    prose-strong:text-primary"
                  dangerouslySetInnerHTML={{ __html: articleWithId.content }}
                />

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-lg font-playfair font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="hover:bg-accent hover:text-accent-foreground cursor-pointer">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
                  <Link to="/journal">
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Journal
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Author */}
                <Card className="p-6">
                  <h3 className="text-lg font-playfair font-semibold mb-4">About the Author</h3>
                  <div className="flex items-start space-x-3">
                    <img
                      src={article.authorImage}
                      alt={article.author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-primary mb-1">{article.author}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{article.authorBio}</p>
                    </div>
                  </div>
                </Card>

                {/* Related Articles */}
                <Card className="p-6">
                  <h3 className="text-lg font-playfair font-semibold mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link key={related.id} to={`/article/${related.id}`}>
                        <div className="flex space-x-3 group cursor-pointer">
                          <img
                            src={related.image}
                            alt={related.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <Badge variant="secondary" className="text-xs mb-1">{related.category}</Badge>
                            <h4 className="text-sm font-medium group-hover:text-accent transition-colors line-clamp-2">
                              {related.title}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Card>

                {/* Newsletter */}
                <Card className="p-6 bg-primary text-primary-foreground">
                  <h3 className="text-lg font-playfair font-semibold mb-4">Stay Updated</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Subscribe to our newsletter for the latest real estate insights and market updates.
                  </p>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Subscribe Now
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ArticleDetail;