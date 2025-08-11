import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calculator, 
  PieChart, 
  BarChart3,
  Target,
  DollarSign,
  Home,
  Building,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

const Investment = () => {
  
  const benefits = [
    {
      icon: DollarSign,
      title: "Passive Income",
      description: "Generate consistent monthly cash flow through rental properties"
    },
    {
      icon: TrendingUp,
      title: "Appreciation",
      description: "Benefit from long-term property value increases over time"
    },
    {
      icon: Target,
      title: "Tax Advantages",
      description: "Take advantage of depreciation, deductions, and tax-deferred exchanges"
    },
    {
      icon: BarChart3,
      title: "Portfolio Diversification",
      description: "Reduce risk by adding real estate to your investment portfolio"
    }
  ];

  const process = [
    {
      step: "01",
      title: "Investment Consultation",
      description: "We analyze your financial goals, risk tolerance, and investment timeline to create a personalized strategy."
    },
    {
      step: "02",
      title: "Market Analysis",
      description: "Our team provides detailed market research and identifies prime investment opportunities in your target areas."
    },
    {
      step: "03",
      title: "Property Selection",
      description: "We present curated investment properties that match your criteria and financial objectives."
    },
    {
      step: "04",
      title: "Financial Planning",
      description: "We help structure financing, calculate returns, and optimize your investment for maximum profitability."
    },
    {
      step: "05",
      title: "Acquisition & Management",
      description: "From closing to ongoing management, we provide comprehensive support for your investment success."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChatBot />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-primary mb-6">
            Real Estate Investment
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Build wealth through strategic real estate investments. Our expert team guides you through 
            every step of your investment journey, from market analysis to portfolio management.
          </p>
          <Link to="/contact">
            <Button size="lg" className="btn-primary">
              Start Your Investment Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Investment Types */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
              Investment Opportunities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore diverse real estate investment options tailored to your financial goals and risk profile
            </p>
          </div>

        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
              Why Invest in Real Estate?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real estate offers unique advantages that make it a cornerstone of successful investment portfolios
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300 group">
                <benefit.icon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-playfair font-semibold text-primary mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
              Our Investment Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A systematic approach to maximize your investment success and minimize risks
            </p>
          </div>
          <div className="space-y-8">
            {process.map((step, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-playfair font-semibold text-primary mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                  {index < process.length - 1 && (
                    <ArrowRight className="hidden md:block w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Market Insights */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary">
                Market Insights & Analysis
              </h2>
              <div className="w-20 h-1 bg-accent rounded-full"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Morocco offers a booming real estate market, stable growth, 
                and high rental yields — and Orchid Island helps you tap into 
                that potential with precision and peace of mind.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Strategic locations with strong growth potential</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Market-driven investment advice</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Legal and tax guidance tailored to your nationality</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span>Full support from purchase to property management</span>
                </div>
              </div>
              <Link to="/price-prediction">
                <Button className="btn-primary">
                  Use Our Price Prediction Tool
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Market analysis charts"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
            Ready to Start Investing?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Let our investment experts help you build a profitable real estate portfolio. 
            Schedule a consultation to discuss your investment goals and opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Schedule Consultation
              </Button>
            </Link>
            <Link to="/properties">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                View Investment Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Investment;