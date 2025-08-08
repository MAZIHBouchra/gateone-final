import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { MapPin, Bed, Bath, Square, Eye, Filter, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

import property1 from '@/assets/property-1.jpg';
import article2 from '@/assets/article-2.jpg';
import article3 from '@/assets/article-3.jpg';
import article5 from '@/assets/article-5.jpg';
import article6 from '@/assets/article-6.jpg';
import article7 from '@/assets/article-7.jpg';

const Properties = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([100000, 5000000]);
  const [filters, setFilters] = useState({
    propertyType: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    sortBy: 'newest',
  });

  const properties = [
    {
      id: 1,
      title: "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm",
      type: "Riad",
      price: 690000,
      location: "Historic medina",
      bedrooms: 4,
      bathrooms: 4,
      area: 335,
      image: property1,
      featured: true,
      description: "Luxury Riad for Sale in Morocco – 4 Bedrooms, Rooftop Terrace & Traditional Charm. The location of this riad in Morocco places you at the center of cultural and historical attractions. The medina is home to bustling souks, artisan workshops, historic sites, and authentic Moroccan cuisine. It’s a short walk to major landmarks, making this a top choice for both lifestyle buyers and short-term rental guests.",
      status: "For Sale"
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
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      featured: false,
      description: "Contemporary apartment in the heart of Manhattan with city views and premium finishes.",
      yearBuilt: 2018,
      garage: 1,
      status: "For Sale"
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
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      featured: true,
      description: "Beautiful family home in prestigious Beverly Hills with spacious rooms and manicured gardens.",
      yearBuilt: 2019,
      garage: 2,
      status: "For Sale"
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
      image: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      featured: true,
      description: "Exclusive penthouse with floor-to-ceiling windows and breathtaking water views.",
      yearBuilt: 2021,
      garage: 2,
      status: "For Sale"
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
      image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      featured: false,
      description: "Charming cottage with beautiful gardens and cozy interior perfect for small families.",
      yearBuilt: 2017,
      garage: 1,
      status: "For Sale"
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
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      featured: false,
      description: "Industrial-style loft with exposed brick walls and modern amenities in trendy neighborhood.",
      yearBuilt: 2016,
      garage: 1,
      status: "For Sale"
    },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const PropertyCard = ({ property }: { property: typeof properties[0] }) => {
    if (viewMode === 'list') {
      return (
        <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-80 flex-shrink-0">
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 md:h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary">{property.type}</Badge>
                  {property.featured && (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-playfair font-semibold text-primary mb-2">
                  {property.title}
                </h3>
                <div className="flex items-center text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </div>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                  {property.area.toLocaleString()} m²
                </div>
                <div>Built: {property.yearBuilt}</div>
                <div>Garage: {property.garage} cars</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-playfair font-bold text-primary">
                  ${property.price.toLocaleString()}
                </div>
                <Link to={`/property/${property.id}`}>
                  <Button className="btn-primary">View Details</Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="property-card group">
        <div className="relative overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary">{property.type}</Badge>
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
              {property.area.toLocaleString()} m²
            </div>
          </div>
          <Link to={`/property/${property.id}`}>
            <Button className="w-full btn-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
              View Details
            </Button>
          </Link>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChatBot />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-primary mb-4">
              Our Properties
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover your perfect property from our curated collection of premium real estate
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {properties.length} properties
            </div>
          </div>

          {showFilters && (
            <Card className="mt-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Select onValueChange={(value) => handleFilterChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                    <SelectItem value="cottage">Cottage</SelectItem>
                    <SelectItem value="loft">Loft</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />

                <Select onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFilterChange('bathrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="area-large">Largest First</SelectItem>
                    <SelectItem value="area-small">Smallest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Price Range</label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={5000000}
                  min={50000}
                  step={50000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Properties Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Properties
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;