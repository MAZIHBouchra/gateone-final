const API_BASE_URL = "http://localhost:8000/api";

// Interface pour TypeScript (Inclusion de thumbnail_url pour le catalogue)
export interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  description: string;
  status: string;
  thumbnail_url?: string;
  created_at?: string;
}

// Fonction utilitaire pour récupérer le token proprement
const getAuthHeader = () => {
  const token = localStorage.getItem('gateone_token');
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const propertiesApi = {
  
  // 1. RÉCUPÉRER TOUS LES BIENS (Filtrés par Agent/Admin au Backend)
  async getAll(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/properties/`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.json();
  },
  
  async getPublicCatalog(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/properties/public`, {
      method: "GET",
      headers: { "Content-Type": "application/json" } // PAS de token ici !
    });
    if (!response.ok) throw new Error("Catalog fetch error");
    return response.json();
  },

  // 2. AJOUTER UN BIEN AVEC IMAGE ET IA (Multipart/FormData)
  async addWithAI(formData: any, imageFile: File | null) {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("price", formData.price.toString());
    data.append("location", formData.location);
    data.append("neighborhood", formData.neighborhood || "N/A");
    data.append("type", formData.type);
    data.append("bedrooms", formData.bedrooms.toString());
    data.append("bathrooms", formData.bathrooms.toString());
    data.append("area_sqm", formData.area_sqm.toString());
    data.append("intent", formData.intent || "Sale");
    data.append("features", formData.features || "");
    data.append("status", formData.status || "available");

    if (imageFile) {
      data.append("image", imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/properties/add-with-ai`, {
      method: "POST",
      headers: { 
        ...getAuthHeader() // ATTENTION: Pas de Content-Type ici, FormData s'en occupe
      },
      body: data, 
    });

    if (!response.ok) throw new Error("Failed to secure listing. Check credentials.");
    return response.json();
  },

  // 3. RÉCUPÉRER L'ARTICLE IA (Avec privilèges Admin/Owner)
  async getAIArticle(propertyId: string) {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/ai-article?is_admin=true`, {
        headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error("Forbidden: Asset analysis restricted.");
    return response.json();
  },

  // 4. RÉCUPÉRER LES POSTS SOCIAUX
  async getSocialPosts(propertyId: string) {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/social-posts`, {
        headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error("Social briefing not found");
    return response.json();
  },
  
  // 5. RÉCUPÉRER UN BIEN PAR SON ID (Pour édition)
  async getById(id: string) {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error("Identity mismatch for asset coordinates");
    return res.json();
  },

  // 6. METTRE À JOUR LES SPECS (Ownership Validation au Backend)
  async update(id: string, formData: any) {
    return fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        title: formData.title,
        intent: formData.intent || "Sale",
        price: parseFloat(formData.price),
        location: formData.location,
        neighborhood: formData.neighborhood,
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area_sqm: parseInt(formData.area_sqm) || 0,
        status: formData.status || "available",
        features: formData.features || formData.description || ""
      })
    });
  },

  // 7. RELANCER LA SYNC IA
  async syncAI(id: string, formData: any) {
    return fetch(`${API_BASE_URL}/properties/${id}/sync-ai`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader() 
      },
      body: JSON.stringify(formData)
    });
  },

  // 8. SUPPRESSION SÉCURISÉE (Le Backend vérifie si l'agent est le propriétaire)
  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, { 
        method: 'DELETE',
        headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error("Revocation denied: Unauthorized access.");
    return response.json();
  }
};