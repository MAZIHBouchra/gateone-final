// API services for properties

export interface Property {
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
  yearBuilt?: number;
  garage?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Formate le prix avec le symbole Euro (ou MAD selon le besoin de l'agence)
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Configuration de l'URL de base via les variables d'environnement Vite
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;

export const propertiesApi = {
  /**
   * Récupère toutes les propriétés (Accès Public)
   */
  async getAll(): Promise<Property[]> {
    const response = await fetch(`${BASE_URL}/api/properties`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    return response.json();
  },

  /**
   * Récupère une propriété par son ID (Accès Public)
   */
  async getById(id: number): Promise<Property | null> {
    const response = await fetch(`${BASE_URL}/api/properties/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch property');
    }
    return response.json();
  },

  /**
   * Crée une nouvelle propriété (ACCÈS SÉCURISÉ)
   */
  async create(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const response = await fetch(`${BASE_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
      // IMPORTANT : Permet d'envoyer les cookies d'authentification admin
      credentials: 'include', 
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Unauthorized or Failed to create property');
    }
    return response.json();
  },

  /**
   * Met à jour une propriété existante (ACCÈS SÉCURISÉ)
   */
  async update(id: number, property: Partial<Property>): Promise<Property> {
    const response = await fetch(`${BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
      // IMPORTANT : Permet d'envoyer les cookies d'authentification admin
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Unauthorized or Failed to update property');
    }
    return response.json();
  },

  /**
   * Supprime une propriété (ACCÈS SÉCURISÉ)
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/properties/${id}`, {
      method: 'DELETE',
      // IMPORTANT : Permet d'envoyer les cookies d'authentification admin
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Unauthorized or Failed to delete property');
    }
  },
};