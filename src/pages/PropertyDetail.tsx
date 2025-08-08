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

import property2 from '@/assets/property-2.jpg';
import property22 from '@/assets/property-22.jpg';
import property222 from '@/assets/property-222.jpg';


const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Property data based on ID
  const propertiesData = {
    1: {
      id: 1,
      title: "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm",
      type: "Riad",
      price: 690000,
      location: "Historic medina",
      bedrooms: 4,
      bathrooms: 4,
      area: 335,
      status: "For Sale",
      featured: true,
      description: "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm. The location of this riad in Morocco places you at the center of cultural and historical attractions. The medina is home to bustling souks, artisan workshops, historic sites, and authentic Moroccan cuisine. It's a short walk to major landmarks, making this a top choice for both lifestyle buyers and short-term rental guests.",
      images: [property1, property11, property111],
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
    },
    2: {
      id: 2,
      title: "Amelkis Golf Villa – For Living or Investment",
      type: "Villa",
      price: 2500000,
      location: "Amelkis Golf Domain, Marrakech",
      bedrooms: 4,
      bathrooms: 6,
      area: 685,
      status: "For Sale",
      featured: false,
      description: "This luxury villa in Amelkis Golf Domain, Marrakech, offers 685 m² of elegant living space, blending Moroccan charm with contemporary finishes. With 4 bedrooms, 6 bathrooms, a private pool, and landscaped gardens, it’s perfect for a serene family home or a high-end investment. Located in a secure, prestigious golf resort just 10 minutes from downtown, it provides both exclusivity and accessibility. Ideal for relocation, second home ownership, or a premium holiday rental opportunity.",
      images: [property2, property222, property22],
      features: [
  "Located in the prestigious Amelkis Golf Domain, Marrakech",
  "685 m² of elegant living space",
  "4 spacious and beautifully finished bedrooms",
  "6 luxurious bathrooms including guest and service facilities",
  "Private swimming pool surrounded by lush greenery",
  "Landscaped garden with multiple outdoor lounge areas",
  "Flooded with natural light through floor-to-ceiling windows",
  "High ceilings and panoramic garden and golf course views",
  "Expansive rooftop terrace for relaxing or entertaining",
  "Multiple outdoor terraces for dining and leisure",
  "Traditional Moroccan design blended with modern finishes",
  "Situated within a gated community with 24/7 security",
  "Direct access to golf course, spa, and fine dining",
  "10 minutes from downtown Marrakech",
  "Ideal for personal residence, second home, or rental investment"

      ],
    },
    3: {
      id: 3,
      title: "Elegant Suburban House",
      type: "House",
      price: 1250000,
      location: "Beverly Hills, CA",
      bedrooms: 4,
      bathrooms: 3,
      area: 2800,
      status: "For Sale",
      featured: true,
      description: "Discover this magnificent suburban home in the prestigious Beverly Hills area. This elegant property combines classic architecture with modern amenities, featuring spacious rooms, a beautiful garden, and a swimming pool. Perfect for families seeking luxury and comfort in a prime location.",
      images: [property1, property11, property111],
      features: [
        "Spacious open-plan living areas",
        "Swimming pool and outdoor entertainment area",
        "Two-car garage with additional storage",
        "Beautifully landscaped garden",
        "High-end kitchen with granite countertops",
        "Master suite with walk-in closet",
        "Home office/study room",
        "Premium security system",
        "Close to top-rated schools"
      ],
    },
    4: {
      id: 4,
      title: "Waterfront Penthouse",
      type: "Penthouse",
      price: 3200000,
      location: "Seattle, WA",
      bedrooms: 3,
      bathrooms: 3,
      area: 2200,
      status: "For Sale",
      featured: true,
      description: "Exceptional waterfront penthouse offering panoramic views of the Puget Sound and city skyline. This luxury residence features an open-concept design, premium finishes, and a private terrace perfect for entertaining. Located in Seattle's most desirable waterfront district.",
      images: [property1, property11, property111],
      features: [
        "Panoramic water and city views",
        "Private elevator access",
        "Wraparound terrace with outdoor kitchen",
        "Floor-to-ceiling windows throughout",
        "Premium Viking appliances",
        "Master suite with spa-like bathroom",
        "Smart home automation system",
        "Concierge and valet services",
        "Marina access and boat slip available"
      ],
    },
    5: {
      id: 5,
      title: "Cozy Garden Cottage",
      type: "Cottage",
      price: 680000,
      location: "Portland, OR",
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      status: "For Sale",
      featured: false,
      description: "Charming garden cottage nestled in Portland's vibrant neighborhood. This cozy home features original hardwood floors, a fireplace, and a beautiful garden sanctuary. Perfect for those seeking character and charm in a peaceful setting while staying close to the city's amenities.",
      images: [property1, property11, property111],
      features: [
        "Original hardwood floors throughout",
        "Cozy fireplace in living room",
        "Beautiful garden with mature trees",
        "Updated kitchen with vintage charm",
        "Covered front porch",
        "Detached garage and workshop",
        "Walking distance to local cafes and shops",
        "Quiet residential neighborhood",
        "Energy-efficient windows and insulation"
      ],
    },
    6: {
      id: 6,
      title: "Contemporary Loft",
      type: "Loft",
      price: 950000,
      location: "Chicago, IL",
      bedrooms: 2,
      bathrooms: 2,
      area: 1500,
      status: "For Sale",
      featured: false,
      description: "Stunning contemporary loft in Chicago's trendy arts district. This industrial-chic space features exposed brick walls, soaring ceilings, and large windows that flood the space with natural light. Perfect for those who appreciate modern design and urban living.",
      images: [property1, property11, property111],
      features: [
        "Exposed brick walls and steel beams",
        "Soaring 14-foot ceilings",
        "Industrial-style kitchen with island",
        "Polished concrete floors",
        "Large windows with city views",
        "In-unit laundry",
        "Building amenities: rooftop deck, gym",
        "Walking distance to galleries and restaurants",
        "Secure building with elevator"
      ],
    },
  };

  const propertyId = parseInt(id || '1');
  const property = propertiesData[propertyId as keyof typeof propertiesData] || propertiesData[1];

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
        <section className="relative h-96 md:h-[500px] overflow-hidden max-w-6xl mx-auto">
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