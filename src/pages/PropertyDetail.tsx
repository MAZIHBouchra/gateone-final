import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

import property1 from '@/assets/property-1.jpg';
import property11 from '@/assets/property-11.jpg';
import property111 from '@/assets/property-111.jpg';


const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock property data - in real app, fetch by ID
  const property = {
    id: parseInt(id || '1'),
    title: "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm.",
    type: "Riad",
    price: 690000,
    location: "Historic medina",
    bedrooms: 4,
    bathrooms: 4,
    area: 335,
    status: "For Sale",
    featured: true,
    description: "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm. The location of this riad in Morocco places you at the center of cultural and historical attractions. The medina is home to bustling souks, artisan workshops, historic sites, and authentic Moroccan cuisine. It’s a short walk to major landmarks, making this a top choice for both lifestyle buyers and short-term rental guests.",
    images: [property1,property11,property111],
    features: [
      "Authentic Moroccan Design (zellige tiles, tadelakt walls, carved cedar wood)",
      "4 Floors + Rooftop Terrace",
      "Rooftop Terrace with Medina Views (ideal for dining, sunbathing, entertaining)",
      "Prime Location in Historic Medina",
      "Investment Opportunity (guesthouse, Airbnb, vacation rental)",
      "Modern Comforts Integrated with Traditional Style",
      "Close to Cultural & Historical Attractions",
      "High-Quality Craftsmanship and Finishes",
      "Photo Gallery and Tours Available on Request"
    ],
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
                    <div className="text-sm text-muted-foreground">m²</div>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-xl font-playfair font-semibold mb-4">About This Property</h3>
                      <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
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
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
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
