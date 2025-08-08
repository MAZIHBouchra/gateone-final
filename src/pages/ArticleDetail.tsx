import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Share, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

import article1 from '@/assets/article-1.jpg';
import article2 from '@/assets/article-2.jpg';
import article3 from '@/assets/article-3.jpg';
import article5 from '@/assets/article-5.jpg';
import article6 from '@/assets/article-6.jpg';
import article7 from '@/assets/article-7.jpg';
const ArticleDetail = () => {
  const { id } = useParams();

  // Mock article data - in real app, fetch by ID
  const article = {
    id: parseInt(id || '1'),
    title: "Marrakech Real Estate Market in 2025 – Key Trends for Investors",
    excerpt: "The Marrakech real estate market in 2025 shows stable growth, driven by economic expansion, tourism, and shifting buyer preferences toward spacious, eco-friendly homes. With opportunities ranging from luxury villas and traditional riads to modern apartments in emerging neighborhoods, the market offers diverse investment potential supported by infrastructure improvements and increasing digitization.",
    category: "Trends",
    date: "2025-08-06",
    readTime: "5 min read",
    image: article1,
    featured: true,
    tags: ["Marrakech real estate 2025", "tips", "mortgage", "home-buying"],
    content: `
  <p>The Marrakech real estate market in 2025 is expected to remain one of Morocco’s most attractive investment sectors. With steady economic growth, urbanization, and evolving consumer preferences, the market offers diverse opportunities—from luxurious villas to modern housing developments.</p>

  <h2 style="font-weight: bold;">Current Market Trends</h2>
  <p>The market continues to show stable, controlled growth, supported by tourism and increasing demand from Moroccan residents abroad (MREs). Historic areas like the Medina appeal to those seeking boutique hotels and riads, while neighborhoods like Targa and Ourika Road offer new homes for middle-class buyers.</p>

  <p>Post-pandemic shifts have increased interest in larger homes with outdoor spaces and pools. Developers are responding with spacious, feature-rich layouts, while eco-friendly, energy-efficient construction is rising, especially in the high-end segment.</p>

  <h2 style="font-weight: bold;">2025 Market Outlook</h2>
  <p>With Morocco's economy expanding and major infrastructure projects like the Al Boraq high-speed train underway, investor confidence is growing. Experts predict price stabilization, while Morocco’s role in the upcoming FIFA World Cup is likely to boost market activity further.</p>

  <p>Digitization is simplifying real estate transactions, offering easier access for both foreign and local investors through online platforms and tools.</p>

  <h2 style="font-weight: bold;">Investment Opportunities by Property Type</h2>
  <h3 style="font-weight: bold;">Luxury Villas</h3>
  <p>Prime areas like Palmeraie and Hivernage offer strong rental potential, particularly during tourist seasons, combining privacy with accessibility.</p>

  <h3 style="font-weight: bold;">Traditional Riads</h3>
  <p>Located in the Medina, these properties are ideal for restoration or use in hospitality, providing high returns through luxury short-term rentals.</p>

  <h3 style="font-weight: bold;">Modern Apartments</h3>
  <p>Developers in areas like Agdal and Targa are meeting demand for urban, well-equipped homes—appealing to professionals and expats.</p>

  <h2 style="font-weight: bold;">High-Growth Neighborhoods</h2>
  <ul>
    <li><strong>Agdal:</strong> Active development zone with strong mixed-use investment potential.</li>
    <li><strong>Targa:</strong> Rapidly growing residential hub for middle-income families.</li>
    <li><strong>Sidi Ghanem:</strong> Emerging industrial and creative district with residential-commercial potential.</li>
  </ul>

  <h2 style="font-weight: bold;">Conclusion</h2>
  <p>The Marrakech real estate market in 2025 offers a compelling blend of growth, diversity, and sustainability. Whether you're interested in luxury properties, traditional riads, or modern urban housing, there are opportunities to suit various strategies. The future is bright for investors ready to enter or expand in this dynamic market.</p>

  <p><em>Interested in Marrakech real estate?</em> Contact us to explore current listings, get tailored advice, and align your strategy with market trends.</p>
`,
  };

  
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
                  dangerouslySetInnerHTML={{ __html: article.content }}
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
                  <h3 className="text-lg font-playfair font-semibold mb-4">Marrakech Investment</h3>
                  <div className="flex items-start space-x-3">
                    
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