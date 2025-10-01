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

import property3 from '@/assets/P3.jpg';
import property31 from '@/assets/P31.jpg';
import property32 from '@/assets/P32.jpg';
import property33 from '@/assets/P33.jpg';
import property34 from '@/assets/P34.jpg';
import property35 from '@/assets/P35.jpg';

import property4 from '@/assets/P4.jpg';
import property41 from '@/assets/P41.jpg';
import property42 from '@/assets/P42.jpg';
import property43 from '@/assets/P43.jpg';
import property44 from '@/assets/P44.jpg';
import property45 from '@/assets/P45.jpg';
import property46 from '@/assets/P46.jpg';
import property47 from '@/assets/P47.jpg';
import property48 from '@/assets/P48.jpg';
import property49 from '@/assets/P49.jpg';
import property40 from '@/assets/P40.jpg';
import property401 from '@/assets/P401.jpg';
import property402 from '@/assets/P402.jpg';

import property5 from '@/assets/p5.jpg';
import property51 from '@/assets/P51.jpg';
import property52 from '@/assets/P52.jpg';
import property53 from '@/assets/P53.jpg';
import property54 from '@/assets/P54.jpg';
import property55 from '@/assets/P55.jpg';
import property56 from '@/assets/P56.jpg';
import property57 from '@/assets/P57.jpg';
import property58 from '@/assets/P58.jpg';
import property59 from '@/assets/P59.jpg';
import property50 from '@/assets/P50.jpg';




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
    3:{
      id: 3,
      title: "Luxury Property with VNA for Sale in Marrakech – Rare 4-Hectare Estate with Villa & Pool",
      type: "Villa",
      price: 1460000, // € pour la villa + 1 hectare (net seller)
      location: "Marrakech, Morocco",
      bedrooms: 4,
      bathrooms: 5,
      area: 400, // surface de la villa
      status: "For Sale",
      featured: true,
      description:
        "This exceptional luxury property in Marrakech spans 4 hectares, subdivided into four 1-hectare lots, featuring a 400 m² villa, a 20-meter swimming pool, and secured VNA (Vocation Non Agricole) authorization. The villa offers spacious, luminous interiors with multiple terraces, ideal for families or hospitality projects. With full administrative clarity, including titles and permits, this estate provides both lifestyle comfort and strategic real estate investment potential.",
      images: [property3, property31, property32, property33, property34, property35],
      features: [
        "Total surface: 4 hectares (divided into 4 titled 1-hectare lots)",
        "Villa: 400 m² with modern comfort and luminous interiors",
        "20-meter swimming pool for leisure, wellness, or entertainment",
        "Administrative clarity: titles, building permits, and VNA authorization secured",
        "Multiple terraces and landscaped grounds for outdoor enjoyment",
        "Flexibility to develop additional villas, boutique hotels, or wellness retreats",
        "Ideal for private residence, holiday home, or boutique hospitality project",
        "Close to Marrakech city center, international restaurants, golf courses, and spas",
        "Privacy, tranquility, and premium lifestyle on 4 hectares of land",
        "High potential for investment and property value appreciation",
        "Immediate start for development projects due to VNA authorization",
        "Combination of lifestyle, luxury, and strategic real estate potential",
        "Perfect for global buyers seeking a second home in Marrakech"
      ]
    },
    4:{
      id: 4,
      title: "Luxury Villas for Sale on RCZ Road, Marrakech: Exclusive Dual-Villa Estate",
      type: "Villa",
      price: 4200000, // € pour l’ensemble (≈ 45,000,000 MAD)
      location: "RCZ Road, Marrakech, Morocco",
      bedrooms: 10, // 4 suites dans la première villa + 6 suites dans la seconde
      bathrooms: 10, // estimation : 4 + 6
      area: 500, // villa principale approx. 500 m² (la seconde peut être estimée similaire)
      status: "For Sale",
      featured: true,
      description:
        "This exclusive dual-villa estate on RCZ Road, Marrakech, spans 9,000 m² and includes two independent luxury villas, landscaped gardens, wellness facilities, and premium leisure amenities. Designed for privacy, comfort, and long-term investment potential, it combines refined living with exceptional lifestyle and rental opportunities.",
      images: [property4, property41, property42, property43, property44, property45, property46, property47, property48, property49, property40, property401, property402],
      features: [
        "Two independent luxury villas with refined architecture and premium finishes",
        "First villa approx. 500 m² with 4 suites, master suite with reception area, fireplace, office, walk-in wardrobe, and luxury bathroom",
        "Second villa with 6 suites, each with private terrace and garden",
        "Bali stone swimming pool with terraces and outdoor lounges",
        "Traditional hammam with marble dome and massage room",
        "Fully equipped gym opening to the garden",
        "Private cinema with professional sound system",
        "Games room with boxing area",
        "Veranda, outdoor bar, and shaded lounges",
        "Professional kitchen with pantry & laundry area",
        "Independent service quarters & garage for 3–5 cars",
        "Mature gardens with ornamental plants, orchard, vegetable patch, and chicken coop",
        "Advanced technical systems: wells with filtration, smart lighting, automatic garden lighting",
        "Full estate security with high-end finishes and durable craftsmanship",
        "Prime location on RCZ Road, Marrakech, with strong investment and rental potential"
      ],
      purchaseOptions: [
        "Price: €4,200,000 (≈ 45,000,000 MAD)",
        "Agency fees: +3%"
      ]
    },
    5:{
      id: 5,
      title: "Apartment for Sale in Marrakech – Luxury 118m² Flat on Boulevard Abdelkarim El Khatabi",
      type: "Apartment",
      price: 2200000, // MAD pour le meublé (≈ 2,200,000 MAD)
      location: "Boulevard Abdelkarim El Khatabi, Marrakech, Morocco",
      bedrooms: 2,
      bathrooms: 2, // estimation : 1 pour master suite + 1 pour la 2ème chambre
      area: 118, // 118 m²
      status: "For Sale",
      featured: false,
      description:
        "This luxury 118m² apartment in Marrakech’s prestigious hotel district offers modern design, multiple balconies, and exclusive amenities. Perfect for families, professionals, and investors, it combines prime location, comfort, and long-term investment potential.",
      images: [property5, property51, property52, property53, property54, property55, property56, property57, property58, property59, property50],
      features: [
        "Master suite with private balcony",
        "Second bedroom with balcony access",
        "Bright, spacious living room",
        "Fully equipped modern kitchen with balcony",
        "Access to secure residential complex",
        "Large communal swimming pool",
        "Centralized Carrier air conditioning",
        "Underground parking with private storage",
        "24/7 building security",
        "Prime location in Marrakech’s hotel district near restaurants, cafés, and shopping centers",
        "Strong rental potential and long-term property value appreciation",
        "Perfect for families, professionals, and expatriates",
        "Flexible purchase options: furnished or unfurnished",
        "Balconies in every room for natural light and ventilation"
      ],
      purchaseOptions: [
        "Furnished: 2,200,000 MAD",
        "Unfurnished: 2,000,000 MAD",
        "Agency fees: +3%"
      ]
    }
    
    
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