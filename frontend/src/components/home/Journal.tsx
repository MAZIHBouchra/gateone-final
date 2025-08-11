import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { articles } from '@/data/articles';

const Journal = () => {
  const featuredArticles = articles.filter(article => article.featured).slice(0, 3);

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
            Tips & Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our latest articles, market insights, and expert advice to make better real estate decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant={article.featured ? "default" : "secondary"}
                    className={article.featured ? "bg-accent text-accent-foreground" : ""}
                  >
                    {article.category}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-playfair font-semibold text-primary mb-3 group-hover:text-accent transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(article.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {article.readTime}
                  </div>
                </div>

                <Link to={`/article/${article.id}`}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between group-hover:bg-accent group-hover:text-accent-foreground transition-colors p-0 h-auto py-2"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/journal">
            <Button variant="outline" size="lg" className="btn-outline">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Journal;