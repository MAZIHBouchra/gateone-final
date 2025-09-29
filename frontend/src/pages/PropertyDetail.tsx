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
import property10 from '@/assets/P10.jpg';
import property11 from '@/assets/P11.jpg';
import property12 from '@/assets/P12.jpg';
import property13 from '@/assets/P13.jpg';
import property14 from '@/assets/P14.jpg';
import property15 from '@/assets/P15.jpg';
import property16 from '@/assets/P16.jpg';
import property17 from '@/assets/P17.jpg';
import property18 from '@/assets/P18.jpg';
import property19 from '@/assets/P19.jpg';



import property2 from '@/assets/property-2.jpg';
import property21 from '@/assets/P21.jpg';
import property22 from '@/assets/P22.jpg';
import property23 from '@/assets/P23.jpg';
import property24 from '@/assets/P24.jpg';
import property25 from '@/assets/P25.jpg';
import property26 from '@/assets/P26.jpg';
import property27 from '@/assets/P27.jpg';
import property28 from '@/assets/P28.jpg';
import property29 from '@/assets/P29.jpg';



const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Property data based on ID
  const propertiesData = {
    1: {
      id: 1,
      title: "Luxury Apartment for Sale in Marrakech: Spacious Living with Terraces and Parking",
      type: "Apartment",
      price: 3000000, // MAD (furnished) – 2,800,000 MAD unfurnished
      location: "Calm Residential Zone, Marrakech",
      bedrooms: 3, // 2 chambres + 1 suite parentale
      bathrooms: 2,
      area: 147,
      status: "For Sale",
      featured: true,
      description:
        "This luxury apartment for sale in Marrakech offers 147 m² of refined living space, including two bright bedrooms and a spacious master suite. Highlights include two private terraces (25 m² and 15 m²), a secure underground parking space, and elegant modern finishes. Located in a calm residential zone, it combines privacy, exclusivity, and proximity to Marrakech’s main attractions. Ideal for professionals, families, or investors seeking comfort and long-term value.",
      images: [property1,property10,property11,property12,property13,property14,property15,property16,property17,property18,property19], // à remplacer par les bonnes images
      features: [
        "147 m² Spacious Interior (2 bedrooms + 1 master suite)",
        "Two Private Terraces (25 m² and 15 m²)",
        "Secure Underground Parking Space",
        "Elegant Modern Finishes & High-Quality Décor",
        "Bright and Airy Living Spaces",
        "Calm Residential Location near City Attractions",
        "Flexible Pricing: 3,000,000 MAD (furnished) or 2,800,000 MAD (unfurnished)",
        "Strong Investment Potential in Marrakech’s Premium Market",
        "Turnkey Option for Homeowners or Rental Investors"
      ],
    },
    2: {
      id: 2,
      title: "Luxury Villa Rental in Marrakech: Modern Targa Retreat",
      type: "Villa",
      price: 35000, // 35,000 DH par mois
      location: "Targa, Marrakech",
      bedrooms: 4,
      bathrooms: 4,
      area: 685,
      status: "For Rent",
      featured: false,
      description:
        "This modern luxury villa in Targa, Marrakech, offers spacious suites, a private pool, and stylish interiors — ideal for families, professionals, and expatriates seeking a serene and well-connected home. Located just 3 km from Jardin Majorelle and 3.2 km from Lycée Victor Hugo, it combines residential tranquility with quick access to cultural and commercial hubs. With contemporary architecture, abundant natural light, and high-end finishes, it ensures comfort, elegance, and functionality for premium living.",
      images: [property2, property21, property22, property23, property24, property25, property26, property27, property28, property29],
      features: [
        "Prime location in Targa, one of Marrakech’s most exclusive residential areas",
        "Spacious double living room with fireplace",
        "Private swimming pool surrounded by landscaped gardens",
        "Large windows offering natural light and scenic garden views",
        "Outdoor lounge and multiple terraces for entertaining",
        "Fully equipped modern kitchen with premium appliances",
        "Ground-floor guest bedroom with en-suite bathroom",
        "Three upstairs suites with dressing areas and private bathrooms",
        "Staff room for on-site assistance",
        "Secure, private environment with enclosed boundaries",
        "Air-conditioning and high-quality insulation for year-round comfort",
        "Close proximity to Lycée Victor Hugo, shopping centers, and restaurants",
        "Easy access to Jardin Majorelle, Gueliz, and the Medina",
        "Perfect for families, professionals, and expatriates",
        "Monthly rent: 35,000 DH with standard lease terms",
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
        <section className="relative h-[500px] md:h-[700px] lg:h-[800px] overflow-hidden max-w-7xl mx-auto">
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