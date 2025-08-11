import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

type Property = {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  category: string;
};

const propertiesData: Property[] = [
  {
    id: 1,
    title: "Modern Apartment in City Center",
    price: 1200,
    location: "Marrakech",
    bedrooms: 2,
    bathrooms: 1,
    category: "Apartment",
  },
  {
    id: 2,
    title: "Spacious Villa with Garden",
    price: 3000,
    location: "Marrakech",
    bedrooms: 4,
    bathrooms: 3,
    category: "Villa",
  },
];

export default function PropertyList() {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 5000,
    bedrooms: '',
    bathrooms: '',
  });

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredProperties = propertiesData.filter(property => {
    return (
      (filters.category ? property.category === filters.category : true) &&
      property.price >= filters.minPrice &&
      property.price <= filters.maxPrice &&
      (filters.bedrooms ? property.bedrooms === Number(filters.bedrooms) : true) &&
      (filters.bathrooms ? property.bathrooms === Number(filters.bathrooms) : true)
    );
  });

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <Select onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="Apartment">Apartment</SelectItem>
              <SelectItem value="Villa">Villa</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 w-[200px]">
            <span>Price:</span>
            <Slider
              defaultValue={[filters.minPrice, filters.maxPrice]}
              min={0}
              max={5000}
              step={100}
              onValueChange={(value) => {
                handleFilterChange('minPrice', value[0]);
                handleFilterChange('maxPrice', value[1]);
              }}
            />
          </div>

          <Input
            type="number"
            placeholder="Bedrooms"
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            className="w-[120px]"
          />
          <Input
            type="number"
            placeholder="Bathrooms"
            value={filters.bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            className="w-[120px]"
          />

          <Button onClick={() => setFilters({
            category: '',
            minPrice: 0,
            maxPrice: 5000,
            bedrooms: '',
            bathrooms: '',
          })}>
            Reset Filters
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProperties.map(property => (
          <Card key={property.id} className="p-4 space-y-2">
            <h3 className="font-bold text-lg">{property.title}</h3>
            <p>{property.location}</p>
            <p>${property.price}</p>
            <div className="flex gap-2">
              <Badge>{property.bedrooms} bd</Badge>
              <Badge>{property.bathrooms} ba</Badge>
              <Badge>{property.category}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
