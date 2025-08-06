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

  // Mock article data - in real app, fetch by ID
  const article = {
    id: parseInt(id || '1'),
    title: "10 Tips for First-Time Home Buyers in 2024",
    excerpt: "Navigate the home buying process with confidence using these expert tips tailored for today's market conditions.",
    category: "Buying Guide",
    author: "Sarah Mitchell",
    authorBio: "Sarah is a senior real estate agent with over 10 years of experience helping first-time buyers navigate the market.",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    date: "2024-01-15",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    featured: true,
    tags: ["first-time-buyer", "tips", "mortgage", "home-buying"],
    content: `
      <p>Buying your first home is one of life's most significant milestones, but it can also feel overwhelming. The real estate market has evolved considerably, especially in recent years, and first-time buyers need to be well-prepared to navigate today's competitive landscape successfully.</p>

      <h2>1. Get Pre-Approved for a Mortgage</h2>
      <p>Before you start house hunting, it's crucial to understand exactly how much you can afford. Getting pre-approved for a mortgage gives you a clear budget and shows sellers that you're a serious buyer. This step involves providing financial documentation to a lender who will then issue a pre-approval letter stating the loan amount you qualify for.</p>

      <h2>2. Research Neighborhoods Thoroughly</h2>
      <p>Don't just focus on the house itself – the neighborhood is equally important. Consider factors like commute times, school districts, local amenities, and future development plans. Visit potential neighborhoods at different times of day and week to get a true feel for the area.</p>

      <h2>3. Work with a Qualified Real Estate Agent</h2>
      <p>A good real estate agent is invaluable for first-time buyers. They can guide you through the process, help you understand market conditions, negotiate on your behalf, and ensure you don't miss important deadlines. Choose an agent who specializes in working with first-time buyers and knows your target areas well.</p>

      <h2>4. Don't Skip the Home Inspection</h2>
      <p>A professional home inspection can reveal potential issues that aren't visible during a casual walkthrough. This includes structural problems, electrical issues, plumbing concerns, and more. While inspections cost money upfront, they can save you thousands in unexpected repairs later.</p>

      <h2>5. Budget for Additional Costs</h2>
      <p>The purchase price is just one part of your total cost. Factor in closing costs (typically 2-3% of the purchase price), moving expenses, immediate repairs or improvements, and ongoing maintenance. It's wise to have extra funds available beyond your down payment and closing costs.</p>

      <h2>6. Understand Different Loan Options</h2>
      <p>There are various mortgage types available, each with different requirements and benefits. FHA loans, VA loans, USDA loans, and conventional loans all have different down payment requirements and qualification criteria. Research what options best fit your situation.</p>

      <h2>7. Be Prepared to Act Quickly</h2>
      <p>In competitive markets, good homes can sell quickly. Be prepared to make decisions fast, but don't let pressure lead you to make poor choices. Have your financing in order and know your absolute maximum budget before you start looking.</p>

      <h2>8. Consider Future Resale Value</h2>
      <p>Even if you plan to stay in your first home for many years, it's smart to consider how easy it will be to sell when the time comes. Factors like location, school districts, and home layout all impact resale value.</p>

      <h2>9. Don't Fall in Love Too Quickly</h2>
      <p>It's easy to get emotionally attached to a property, but try to remain objective during your search. Every home has pros and cons, and it's important to evaluate each property rationally against your needs and budget.</p>

      <h2>10. Plan for the Long Term</h2>
      <p>Consider your future needs when choosing a home. Are you planning to start a family? Change careers? Your housing needs may evolve, so think about whether a property can adapt to your changing circumstances or if you'll need to move again soon.</p>

      <h3>Final Thoughts</h3>
      <p>Buying your first home is a significant achievement and investment in your future. By following these tips and working with experienced professionals, you can navigate the process more confidently and find a home that meets your needs and budget. Remember, the perfect home may not exist, but the right home for you certainly does.</p>

      <p>Take your time, do your research, and don't be afraid to ask questions throughout the process. Every experienced homeowner was once a first-time buyer, and with proper preparation, your home buying journey can be both successful and rewarding.</p>
    `,
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