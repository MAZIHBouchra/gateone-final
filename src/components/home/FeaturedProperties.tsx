import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';
import property4 from '@/assets/property-4.jpg';
import property5 from '@/assets/property-5.jpg';
import property6 from '@/assets/property-6.jpg';

const FeaturedProperties = () => {
  const properties = [
    {
      id: 1,
      title: "Luxury Villa with Ocean View",
      type: "Villa",
      price: 2850000,
      location: "Miami Beach, FL",
      bedrooms: 5,
      bathrooms: 4,
      area: 4200,
      image: property1,
      featured: true,
    },
    {
      id: 2,
      title: "Modern Downtown Apartment",
      type: "Apartment",
      price: 850000,
      location: "Manhattan, NY",
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      image: property2,
      featured: false,
    },
    {
      id: 3,
      title: "Elegant Suburban House",
      type: "House",
      price: 1250000,
      location: "Beverly Hills, CA",
      bedrooms: 4,
      bathrooms: 3,
      area: 2800,
      image: property3,
      featured: true,
    },
    {
      id: 4,
      title: "Waterfront Penthouse",
      type: "Penthouse",
      price: 3200000,
      location: "Seattle, WA",
      bedrooms: 3,
      bathrooms: 3,
      area: 2200,
      image: property4,
      featured: true,
    },
    {
      id: 5,
      title: "Cozy Garden Cottage",
      type: "Cottage",
      price: 680000,
      location: "Portland, OR",
      bedrooms: 3,
      bathrooms: 2,
      area: 1800,
      image: property5,
      featured: false,
    },
    {
      id: 6,
      title: "Contemporary Loft",
      type: "Loft",
      price: 950000,
      location: "Chicago, IL",
      bedrooms: 2,
      bathrooms: 2,
      area: 1500,
      image: property6,
      featured: false,
    },
  ];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium properties that offer exceptional value and luxury living
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Card key={property.id} className="property-card group">
              <div className="relative overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {property.type}
                  </Badge>
                  {property.featured && (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white text-primary">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-playfair font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location}
                  </div>
                  <div className="text-2xl font-playfair font-bold text-primary">
                    ${property.price.toLocaleString()}
                  </div>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground border-t pt-4">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    {property.bedrooms} Beds
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {property.bathrooms} Baths
                  </div>
                  <div className="flex items-center">
                    <Square className="w-4 h-4 mr-1" />
                    {property.area.toLocaleString()} sqft
                  </div>
                </div>

                <Link to={`/property/${property.id}`}>
                  <Button className="w-full btn-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/properties">
            <Button variant="outline" size="lg" className="btn-outline">
              View All Properties
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;