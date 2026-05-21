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
  async addWithAI(formData: any, imageFile: File | null) {
    // 1. On crée le conteneur FormData
    const data = new FormData();

    // 2. On ajoute les champs textuels un par un (doit correspondre aux noms dans le Backend)
    data.append("title", formData.title);
    data.append("price", formData.price.toString());
    data.append("location", formData.location);
    data.append("neighborhood", formData.neighborhood || "N/A");
    data.append("type", formData.type);
    data.append("bedrooms", formData.bedrooms.toString());
    data.append("bathrooms", formData.bathrooms.toString());
    data.append("area_sqm", formData.area_sqm.toString());
    data.append("intent", formData.intent);
    data.append("features", `Plot: ${formData.plot_size || 0}m2, Features: ${formData.features}`);
    data.append("status", formData.status || "available");

    // 3. On ajoute le fichier s'il existe
    if (imageFile) {
      data.append("image", imageFile);
    }

    // 4. On envoie la requête (Attention : ne PAS mettre de Content-Type header !)
    const response = await fetch(`${API_BASE_URL}/properties/add-with-ai`, {
      method: "POST",
      body: data, 
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
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