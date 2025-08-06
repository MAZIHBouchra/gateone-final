import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car,
  Calendar,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock property data - in real app, fetch by ID
  const property = {
    id: parseInt(id || '1'),
    title: "Luxury Villa with Ocean View",
    type: "Villa",
    price: 2850000,
    location: "Miami Beach, FL",
    fullAddress: "123 Ocean Drive, Miami Beach, FL 33139",
    bedrooms: 5,
    bathrooms: 4,
    area: 4200,
    lotSize: 8500,
    yearBuilt: 2020,
    garage: 3,
    status: "For Sale",
    featured: true,
    description: "Stunning oceanfront villa with panoramic views, private beach access, and world-class amenities. This architectural masterpiece combines modern luxury with coastal elegance, featuring floor-to-ceiling windows, premium finishes, and an open-concept design that maximizes the breathtaking ocean views.",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    ],
    features: [
      "Ocean front location",
      "Private beach access",
      "Infinity pool",
      "Smart home technology",
      "Gourmet kitchen with premium appliances",
      "Master suite with walk-in closet",
      "Home theater",
      "Wine cellar",
      "3-car garage",
      "Landscaped gardens",
      "Security system",
      "Central air conditioning"
    ],
    agent: {
      name: "Sarah Mitchell",
      phone: "+1 (555) 123-4568",
      email: "sarah@gateone.com",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    neighborhood: {
      schools: "Excellent (9/10)",
      walkScore: 85,
      transitScore: 72,
      crimeRate: "Low",
      nearbyPlaces: [
        "Beach - 0.1 miles",
        "Shopping Center - 0.5 miles",
        "School - 0.8 miles",
        "Hospital - 1.2 miles",
        "Airport - 15 miles"
      ]
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChatBot />
      
      <div className="pt-20">
        {/* Image Gallery */}
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          {property.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Property view ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          
          {/* Navigation */}
          <Button
            variant="ghost"
            size="lg"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary"
            onClick={prevImage}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white text-primary"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white text-primary"
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </section>

        {/* Property Info */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{property.type}</Badge>
                    {property.featured && (
                      <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                    )}
                    <Badge variant="outline">{property.status}</Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    {property.fullAddress}
                  </div>
                  <div className="text-4xl font-playfair font-bold text-primary">
                    ${property.price.toLocaleString()}
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card className="p-4 text-center">
                    <Bed className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-muted-foreground">Bedrooms</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Bath className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.bathrooms}</div>
                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Square className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.area.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Sq Ft</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Car className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.garage}</div>
                    <div className="text-sm text-muted-foreground">Garage</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{property.yearBuilt}</div>
                    <div className="text-sm text-muted-foreground">Built</div>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="neighborhood">Neighborhood</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-xl font-playfair font-semibold mb-4">About This Property</h3>
                      <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                        <div>
                          <strong>Lot Size:</strong> {property.lotSize.toLocaleString()} sq ft
                        </div>
                        <div>
                          <strong>Year Built:</strong> {property.yearBuilt}
                        </div>
                        <div>
                          <strong>Property Type:</strong> {property.type}
                        </div>
                        <div>
                          <strong>Status:</strong> {property.status}
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="features" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-xl font-playfair font-semibold mb-4">Property Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="neighborhood" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-xl font-playfair font-semibold mb-4">Neighborhood Info</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Scores</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Schools:</span>
                              <span className="text-primary font-semibold">{property.neighborhood.schools}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Walk Score:</span>
                              <span className="text-primary font-semibold">{property.neighborhood.walkScore}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Transit Score:</span>
                              <span className="text-primary font-semibold">{property.neighborhood.transitScore}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Crime Rate:</span>
                              <span className="text-primary font-semibold">{property.neighborhood.crimeRate}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Nearby Places</h4>
                          <div className="space-y-2">
                            {property.neighborhood.nearbyPlaces.map((place, index) => (
                              <div key={index} className="flex items-center text-muted-foreground">
                                <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                                {place}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Agent Card */}
                <Card className="p-6">
                  <h3 className="text-xl font-playfair font-semibold mb-4">Contact Agent</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={property.agent.image}
                      alt={property.agent.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-primary">{property.agent.name}</div>
                      <div className="text-sm text-muted-foreground">Real Estate Agent</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <a href={`tel:${property.agent.phone}`}>
                      <Button className="w-full btn-primary">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Agent
                      </Button>
                    </a>
                    <a href={`mailto:${property.agent.email}`}>
                      <Button variant="outline" className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Agent
                      </Button>
                    </a>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="text-xl font-playfair font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full btn-secondary">Schedule Viewing</Button>
                    <Button variant="outline" className="w-full">Get Financing</Button>
                    <Button variant="outline" className="w-full">Property Report</Button>
                  </div>
                </Card>

                {/* Back to Properties */}
                <Link to="/properties">
                  <Button variant="outline" className="w-full">
                    ← Back to Properties
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;