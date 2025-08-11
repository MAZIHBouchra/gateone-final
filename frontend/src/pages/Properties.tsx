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
import { properties } from '@/data/properties';

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
                {property.yearBuilt && <div>Built: {property.yearBuilt}</div>}
                {property.garage && <div>Garage: {property.garage} cars</div>}
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