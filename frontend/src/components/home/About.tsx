import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, Users, Home, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import aboutHeroImage from '@/assets/orchid.jpg';

const About = () => {
  const stats = [
    {
      icon: Home,
      number: "350+",
      label: "Properties Sold",
    },
    {
      icon: Users,
      number: "1,785+",
      label: "Happy Clients",
    },
    {
      icon: Award,
      number: "254+",
      label: "Project Complete",
    },
    {
      icon: TrendingUp,
      number: "116",
      label: "Winning Awards",
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary">
                Welcome to GateOne
              </h2>
              <div className="w-20 h-1 bg-accent rounded-full"></div>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              At GateOne, we believe that finding the perfect property in Marrakech should be more than just a transaction, 
              it should be a truly exceptional experience. With many years of experience in the Marrakech real estate market, 
              we have helped multiple clients discover luxury villas, traditional riads, and exclusive investment properties 
              across the Red City.

            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              As a leading real estate agency in Marrakech, we specialize in high-end properties, offering tailor-made solutions 
              for both local and international clients. Our dedicated team combines deep local knowledge, market expertise, and 
              personalized service to guide you through every step – whether you’re buying, selling, or investing in Marrakech 
              real estate.

            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-playfair font-semibold text-primary">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To transform the real estate experience in Marrakech by delivering unmatched service, 
                innovative digital tools, and expert guidance. We empower our clients to make confident, 
                informed decisions in one of Morocco’s most sought-after property markets.

              </p>
            </div>

            <div className="pt-4">
              <Link to="/about">
                <Button className="btn-primary">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Image and Stats */}
          <div className="space-y-6">
            <div className="relative">
              <img
                src={aboutHeroImage}
                alt="Luxury property interior"
                className="w-full h-80 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <div className="text-2xl font-playfair font-bold text-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;