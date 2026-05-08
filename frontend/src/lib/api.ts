const API_BASE_URL = "http://localhost:8000/api";

// Interface pour TypeScript
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
  created_at?: string;
}

export const propertiesApi = {
  // 1. RÉCUPÉRER TOUS LES BIENS (Celle qui manquait !)
  async getAll(): Promise<Property[]> {
    console.log("Fetching all properties from:", `${API_BASE_URL}/properties/`);
    const response = await fetch(`${API_BASE_URL}/properties/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error fetching properties");
    const data = await response.json();
    console.log("🔍 Data received from backend:", data);
    return data;
  },

  // 2. AJOUTER UN BIEN AVEC IA
  async addWithAI(formData: any) {
    const response = await fetch(`${API_BASE_URL}/properties/add-with-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        intent: formData.intent,
        price: parseFloat(formData.price) || 0,
        location: formData.location,
        neighborhood: formData.neighborhood || "Non spécifié",
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area_sqm: parseInt(formData.area_sqm) || 0,
        status: formData.status || "available",
        features: `Plot size: ${formData.plot_size || 0}m2, Features: ${formData.features}`
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error 422 or 500");
    }
    return response.json();
  },

  // 3. RÉCUPÉRER L'ARTICLE IA
  async getAIArticle(propertyId: string) {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/ai-article`);
    if (!response.ok) throw new Error("Article not found");
    return response.json();
  },

  // 4. RÉCUPÉRER LES POSTS SOCIAUX
  async getSocialPosts(propertyId: string) {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/social-posts`);
    if (!response.ok) throw new Error("Social posts not found");
    return response.json();
  }
};