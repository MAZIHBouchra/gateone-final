import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bed, Bath, Square, Heart, Share, ChevronLeft, ChevronRight, Loader, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';
import { propertiesApi, Property, formatPrice } from '@/services/api';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = id || "1";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer la propriété depuis l'API
  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await propertiesApi.getById(parseInt(propertyId));
      if (data) {
        setProperty(data);
      } else {
        setError('Propriété non trouvée');
      }
    } catch (err) {
      setError('Erreur lors de la récupération de la propriété');
      console.error('Erreur lors de la récupération de la propriété:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger la propriété au montage du composant
  useEffect(() => {
    fetchProperty();
  }, [propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextImage = () => {
    if (property && property.images) {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property && property.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Chargement de la propriété...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Square className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Propriété non trouvée</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/properties">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux propriétés
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Si pas de propriété trouvée
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600">Aucune propriété trouvée</p>
            <Link to="/properties">
              <Button className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux propriétés
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Galerie d'images */}
      <section className="relative">
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          {property.images && property.images.length > 0 ? (
            property.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title} - vue ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://picsum.photos/800/600?random=${property.id}-${index}`;
                }}
              />
            ))
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
              <Square className="w-24 h-24 text-gray-400" />
            </div>
          )}

          {/* Navigation - seulement si il y a plusieurs images */}
          {property.images && property.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full shadow-md"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: property.title,
                    text: property.description,
                    url: window.location.href,
                  });
                }
              }}
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>

          {/* Indicateurs d'images */}
          {property.images && property.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Informations de la propriété */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* En-tête */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">{property.type}</Badge>
                  <Badge variant={property.status === 'For Sale' ? 'default' : 'secondary'}>
                    {property.status}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <Square className="w-4 h-4 mr-1" />
                  {property.location}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(property.price)}
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Bed className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Chambres</div>
                </div>
                <div className="text-center">
                  <Bath className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Salles de bain</div>
                </div>
                <div className="text-center">
                  <Square className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="font-semibold">{property.area}</div>
                  <div className="text-sm text-gray-600">m²</div>
                </div>
                {property.yearBuilt && (
                  <div className="text-center">
                    <div className="font-semibold">{property.yearBuilt}</div>
                    <div className="text-sm text-gray-600">Année</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Caractéristiques */}
              {property.features && property.features.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Caractéristiques</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Intéressé par cette propriété ?</h3>
              <div className="space-y-3">
                <Button className="w-full">
                  Contacter l'agent
                </Button>
                <Button variant="outline" className="w-full">
                  Planifier une visite
                </Button>
                <Button variant="outline" className="w-full">
                  Demander plus d'infos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChatBot />
      <Footer />
    </div>
  );
};

export default PropertyDetails;
