import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Search,
  Filter,
  Heart,
  DollarSign
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';
import { propertiesApi, Property, formatPrice } from '@/services/api';

const PropertiesList = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('all');

  // Types de propriétés
  const propertyTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'Riad', label: 'Riad' },
    { value: 'Villa', label: 'Villa' },
    { value: 'House', label: 'Maison' },
    { value: 'Penthouse', label: 'Penthouse' },
    { value: 'Cottage', label: 'Cottage' },
    { value: 'Loft', label: 'Loft' },
    { value: 'Apartment', label: 'Appartement' }
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const data = await propertiesApi.getAll();
        setProperties(data);
        setFilteredProperties(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des propriétés');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = properties;

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    // Filtre par prix minimum
    if (minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(minPrice));
    }

    // Filtre par prix maximum
    if (maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(maxPrice));
    }

    // Filtre par nombre de chambres
    if (bedrooms && bedrooms !== 'all') {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(bedrooms));
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, selectedType, minPrice, maxPrice, bedrooms]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des propriétés...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nos Propriétés
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Découvrez notre sélection exclusive de propriétés d'exception
            </p>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre ou localisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type de propriété" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Prix minimum */}
            <Input
              type="number"
              placeholder="Prix min (€)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            {/* Prix maximum */}
            <Input
              type="number"
              placeholder="Prix max (€)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            {/* Chambres */}
            <div className="flex gap-2">
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Chambres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">
              {filteredProperties.length} propriété(s) trouvée(s)
            </p>
          </div>
        </div>
      </section>

      {/* Liste des propriétés */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                Aucune propriété ne correspond à vos critères
              </p>
              <Button onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/400/300';
                      }}
                    />
                    {property.featured && (
                      <Badge className="absolute top-4 left-4 bg-yellow-500">
                        En vedette
                      </Badge>
                    )}
                    <Badge
                      className="absolute top-4 right-4"
                      variant={property.status === 'For Sale' ? 'default' : 'secondary'}
                    >
                      {property.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute bottom-4 right-4 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{property.type}</Badge>
                      <div className="flex items-center text-primary font-bold text-lg">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatPrice(property.price)}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{property.title}</CardTitle>
                    <CardDescription className="flex items-center text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms} ch.
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms} sdb.
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {property.area} m²
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {property.description}
                    </p>

                    <Link to={`/property/${property.id}`}>
                      <Button className="w-full">
                        Voir les détails
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <ChatBot />
      <Footer />
    </div>
  );
};

export default PropertiesList;
