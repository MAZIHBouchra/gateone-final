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

// Format price with Euro symbol
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// API functions
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;

export const propertiesApi = {
  async getAll(): Promise<Property[]> {
    const response = await fetch(`${BASE_URL}/api/properties`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    return response.json();
  },

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

  async create(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    const response = await fetch(`${BASE_URL}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
    });
    if (!response.ok) {
      throw new Error('Failed to create property');
    }
    return response.json();
  },

  async update(id: number, property: Partial<Property>): Promise<Property> {
    const response = await fetch(`${BASE_URL}/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
    });
    if (!response.ok) {
      throw new Error('Failed to update property');
    }
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/properties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete property');
    }
  },
};
