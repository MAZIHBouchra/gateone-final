import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Euro
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: string;
  featured: boolean;
  description: string;
  image: string;
  images: string[];
  features: string[];
  yearBuilt: number;
  garage?: number;
  created_at: string;
  updated_at: string;
}

const AdminProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    verifyAuthAndFetch();
  }, []);

  const verifyAuthAndFetch = async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
      const meRes = await fetch(`${base}/api/admin/me`, { credentials: 'include' });
      const me = await meRes.json();
      if (!me.authenticated) {
        navigate('/adminlogin');
        return;
      }
      const response = await fetch(`${base}/api/properties`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des propriétés:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      try {
        const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
        const response = await fetch(`${base}/admin/properties/delete/${id}`, {
          method: 'POST',
          credentials: 'include'
        });
        if (response.ok) {
          setProperties(properties.filter(property => property.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
      await fetch(`${base}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/adminlogin');
    } catch (error) {
      navigate('/adminlogin');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Gestion des Propriétés
              </h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Actions Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher des propriétés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button onClick={() => navigate('/admin/properties/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une propriété
            </Button>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="text-center py-8">Chargement des propriétés...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="aspect-video bg-gray-200 rounded-md mb-3 overflow-hidden relative">
                      <img 
                        src={(property.image && (property.image.startsWith('http') ? property.image : `${(import.meta.env.VITE_API_BASE_URL ?? window.location.origin)}${property.image}`)) || ''} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `${(import.meta.env.VITE_API_BASE_URL ?? window.location.origin)}/api/placeholder/400/200`;
                        }}
                      />
                      {property.featured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500">
                          En vedette
                        </Badge>
                      )}
                      <Badge 
                        className="absolute top-2 right-2"
                        variant={property.status === 'For Sale' ? 'default' : 'secondary'}
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {property.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary font-bold text-lg">
                          <Euro className="h-4 w-4 mr-1" />
                          {formatPrice(property.price)}
                        </div>
                        <Badge variant="outline">{property.type}</Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.location}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
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
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/admin/properties/edit/${property.id}`)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(property.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredProperties.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune propriété</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter votre première propriété.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/admin/properties/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une propriété
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminProperties;
