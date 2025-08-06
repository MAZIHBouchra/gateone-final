import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Home, DollarSign, Bed } from 'lucide-react';
import { Link } from 'react-router-dom';

const PropertySearch = () => {
  const [priceRange, setPriceRange] = useState([100000, 2000000]);
  const [filters, setFilters] = useState({
    propertyType: '',
    location: '',
    bedrooms: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Navigate to properties page with filters
    console.log('Search with filters:', { ...filters, priceRange });
  };

  return (
    <section className="section-padding bg-card">
      <div className="container-custom">
        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
              Find Your Perfect Property
            </h2>
            <p className="text-muted-foreground text-lg">
              Use our advanced search to discover properties that match your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Property Type */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-foreground">
                <Home className="w-4 h-4 mr-2 text-primary" />
                Property Type
              </label>
              <Select onValueChange={(value) => handleFilterChange('propertyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                Location
              </label>
              <Input
                placeholder="Enter location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-foreground">
                <Bed className="w-4 h-4 mr-2 text-primary" />
                Bedrooms
              </label>
              <Select onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4 Bedrooms</SelectItem>
                  <SelectItem value="5+">5+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-transparent">Search</label>
              <Link to="/properties">
                <Button className="btn-primary w-full h-10" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-medium text-foreground">
              <DollarSign className="w-4 h-4 mr-2 text-primary" />
              Price Range
            </label>
            <div className="px-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={5000000}
                min={50000}
                step={50000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>${priceRange[0].toLocaleString()}</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/properties">
              <Button variant="outline" className="btn-outline">
                Advanced Search
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default PropertySearch;