import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, Users, Home, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    {
      icon: Home,
      number: "500+",
      label: "Properties Sold",
    },
    {
      icon: Users,
      number: "1000+",
      label: "Happy Clients",
    },
    {
      icon: Award,
      number: "15+",
      label: "Years Experience",
    },
    {
      icon: TrendingUp,
      number: "98%",
      label: "Client Satisfaction",
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
              At GateOne, we believe that finding the perfect property should be an exceptional experience. 
              With over 15 years of expertise in the luxury real estate market, we've helped thousands of 
              clients discover their dream homes and make smart investment decisions.
            </p>
            
            <p className="text-muted-foreground leading-relaxed">
              Our team of dedicated professionals combines deep market knowledge with personalized service 
              to ensure every client receives the attention they deserve. From first-time buyers to seasoned 
              investors, we guide you through every step of your real estate journey.
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-playfair font-semibold text-primary">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To revolutionize the real estate experience by providing unparalleled service, 
                innovative technology, and expert guidance that empowers our clients to make 
                confident property decisions.
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
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
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