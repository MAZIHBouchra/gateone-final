import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LayoutDashboard, 
  Home, 
  Save, 
  ArrowLeft,
  LogOut,
  Loader2
} from 'lucide-react';

interface Property {
  id: number | string;
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
}

const AdminEditProperty: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    status: 'For Sale',
    featured: false,
    description: '',
    image: '',
    images: [''],
    features: [''],
    yearBuilt: '',
    garage: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const propertyTypes = [
    'Riad',
    'Villa',
    'House',
    'Penthouse',
    'Cottage',
    'Loft',
    'Apartment'
  ];

  const statusOptions = [
    'For Sale',
    'Sold',
    'Under Contract',
    'Off Market'
  ];

  useEffect(() => {
    if (id) {
      fetchProperty(id);
    }
  }, [id]);

  const fetchProperty = async (propertyId: string) => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
      const response = await fetch(`${base}/api/properties/${propertyId}`);
      if (response.ok) {
        const foundProperty: Property = await response.json();
        setProperty(foundProperty);
        setFormData({
          title: foundProperty.title || '',
          type: foundProperty.type || '',
          price: (foundProperty.price ?? '').toString(),
          location: foundProperty.location || '',
          bedrooms: (foundProperty.bedrooms ?? '').toString(),
          bathrooms: (foundProperty.bathrooms ?? '').toString(),
          area: (foundProperty.area ?? '').toString(),
          status: foundProperty.status || 'For Sale',
          featured: Boolean(foundProperty.featured),
          description: foundProperty.description || '',
          image: foundProperty.image || '',
          images: (foundProperty as any).images && (foundProperty as any).images.length > 0 ? (foundProperty as any).images : [''],
          features: (foundProperty as any).features && (foundProperty as any).features.length > 0 ? (foundProperty as any).features : [''],
          yearBuilt: (foundProperty.yearBuilt ?? '').toString(),
          garage: (foundProperty.garage ?? '').toString()
        });
      } else if (response.status === 404) {
        setError('Propriété non trouvée');
      } else {
        setError("Erreur lors du chargement de la propriété");
      }
    } catch (error) {
      setError('Erreur lors du chargement de la propriété');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'images' | 'features', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'images' | 'features') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'images' | 'features', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('type', formData.type);
      submitData.append('price', formData.price);
      submitData.append('location', formData.location);
      submitData.append('bedrooms', formData.bedrooms);
      submitData.append('bathrooms', formData.bathrooms);
      submitData.append('area', formData.area);
      submitData.append('status', formData.status);
      submitData.append('featured', formData.featured.toString());
      submitData.append('description', formData.description);
      submitData.append('image', formData.image);
      submitData.append('images', JSON.stringify(formData.images.filter(img => img.trim())));
      submitData.append('features', JSON.stringify(formData.features.filter(feat => feat.trim())));
      submitData.append('yearBuilt', formData.yearBuilt);
      submitData.append('garage', formData.garage);

      const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
      const targetId = typeof property?.id === 'number' ? property.id : id;
      const response = await fetch(`${base}/admin/properties/edit/${targetId}`, {
        method: 'POST',
        body: submitData,
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Propriété modifiée avec succès !');
        setTimeout(() => {
          navigate('/admin/properties');
        }, 2000);
      } else {
        setError('Erreur lors de la modification de la propriété');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement de la propriété...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Propriété non trouvée</h2>
          <Button onClick={() => navigate('/admin/properties')}>
            Retour aux propriétés
          </Button>
        </div>
      </div>
    );
  }

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
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/properties')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Propriétés
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Modifier la Propriété
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Modifier la Propriété #{property.id}
              </CardTitle>
              <CardDescription>
                Modifiez les informations de cette propriété.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre de la propriété *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Villa de luxe avec piscine"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type de propriété *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="690000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Marrakech, Maroc"
                      required
                    />
                  </div>
                </div>

                {/* Caractéristiques */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Chambres *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      placeholder="4"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Salles de bain *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      placeholder="3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Surface (m²) *</Label>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      placeholder="335"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearBuilt">Année de construction</Label>
                    <Input
                      id="yearBuilt"
                      type="number"
                      value={formData.yearBuilt}
                      onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                </div>

                {/* Statut et options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="garage">Nombre de garages</Label>
                    <Input
                      id="garage"
                      type="number"
                      value={formData.garage}
                      onChange={(e) => handleInputChange('garage', e.target.value)}
                      placeholder="2"
                    />
                  </div>
                </div>

                {/* En vedette */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked as boolean)}
                  />
                  <Label htmlFor="featured">Mettre en vedette cette propriété</Label>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description détaillée de la propriété..."
                    rows={6}
                    required
                  />
                </div>

                {/* Image principale */}
                <div className="space-y-2">
                  <Label htmlFor="image">Image principale *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="/images/property-example.jpg"
                    required
                  />
                </div>

                {/* Messages */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Boutons */}
                <div className="flex space-x-4 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Modification en cours...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Modifier la propriété
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/admin/properties')}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminEditProperty;
