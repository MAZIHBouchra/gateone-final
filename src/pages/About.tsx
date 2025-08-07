import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Users, 
  Home, 
  TrendingUp, 
  Target, 
  Heart, 
  Shield,
  Star,
  MapPin,
  Phone,
  Mail,
  Linkedin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';
import orchid from '@/assets/orchid.jpg';


const About = () => {
  const stats = [
    { icon: Home, number: "350+", label: "Properties Sold" },
    { icon: Users, number: "1785+", label: "Happy Clients" },
    { icon: Award, number: "254+", label: "Project Complete" },
    { icon: TrendingUp, number: "116", label: "Winning Awards" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Client-Centered",
      description: "Every decision we make puts our clients' needs and dreams at the forefront."
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We operate with complete transparency and honesty in all our dealings."
    },
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for perfection in every service we provide and every relationship we build."
    },
    {
      icon: Star,
      title: "Innovation",
      description: "We embrace technology and modern methods to enhance your real estate experience."
    }
  ];

  const team = [
    {
      name: "Alexander GateOne",
      role: "CEO & Founder",
      experience: "15+ years",
      specialization: "Luxury Properties & Commercial Real Estate",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Alexander founded GateOne with a vision to revolutionize real estate services. With over 15 years of experience in luxury and commercial properties, he leads our team with passion and expertise.",
      phone: "+1 (555) 123-4567",
      email: "alexander@gateone.com",
      linkedin: "alexander-gateone"
    },
    {
      name: "Sarah Mitchell",
      role: "Senior Real Estate Agent",
      experience: "10+ years",
      specialization: "Residential & First-Time Buyers",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Sarah specializes in helping first-time buyers navigate the real estate market. Her patient approach and market knowledge have helped hundreds of families find their perfect home.",
      phone: "+1 (555) 123-4568",
      email: "sarah@gateone.com",
      linkedin: "sarah-mitchell-re"
    },
    {
      name: "Michael Chen",
      role: "Investment Specialist",
      experience: "12+ years",
      specialization: "Investment Properties & Market Analysis",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Michael brings deep financial analysis expertise to our team. He helps investors identify profitable opportunities and maximize their real estate portfolio returns.",
      phone: "+1 (555) 123-4569",
      email: "michael@gateone.com",
      linkedin: "michael-chen-investments"
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
            About GateOne
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're not just real estate agents - we're your partners in finding the perfect property 
            and making sound investment decisions. Discover our story, values, and the team that makes it all possible.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary">
                Our Mission
              </h2>
              <div className="w-20 h-1 bg-accent rounded-full"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At GateOne, we believe that finding the perfect property in Marrakech should be more than 
                just a transaction, it should be a truly exceptional experience. With many years of experience 
                in the Marrakech real estate market, we have helped multiple clients discover luxury villas, 
                traditional riads, and exclusive investment properties across the Red City.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As a leading real estate agency in Marrakech, we specialize in high-end properties, offering 
                tailor-made solutions for both local and international clients. Our dedicated team combines 
                deep local knowledge, market expertise, and personalized service to guide you through every 
                step – whether you’re buying, selling, or investing in Marrakech real estate.


              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we're proud to have helped over 1,000 clients find their perfect homes and 
                assisted countless investors in building wealth through strategic real estate decisions. 
                Our success is measured not just in properties sold, but in dreams realized and futures secured.
              </p>
            </div>
            <div className="relative">
              <img 
                src={orchid}
                alt="GateOne office"
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
              Our Track Record
            </h2>
            <p className="text-lg text-muted-foreground">
              Numbers that reflect our commitment to excellence
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-playfair font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and shape how we serve our clients
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300 group">
                <value.icon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-playfair font-semibold text-primary mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The experienced professionals dedicated to making your real estate dreams come true
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-playfair font-semibold text-primary">{member.name}</h3>
                    <Badge variant="secondary" className="mt-1">{member.role}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Experience:</strong> {member.experience}</div>
                    <div><strong>Specialization:</strong> {member.specialization}</div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-primary" />
                      {member.phone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-primary" />
                      {member.email}
                    </div>
                    <div className="flex items-center">
                      <Linkedin className="w-4 h-4 mr-2 text-primary" />
                      {member.linkedin}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
            Ready to Work With Us?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you're buying, selling, or investing, our team is here to guide you 
            through every step of your real estate journey.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;