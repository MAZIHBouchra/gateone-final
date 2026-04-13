const API_BASE_URL = "http://localhost:8000/api";

// --- AJOUT DE L'INTERFACE (Indispensable pour PropertiesPage.tsx) ---
export interface Property {
  id: string; // UUID
  title: string;
  type: string;
  price: number;
  location: string;
  neighborhood?: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  description: string;
  status: string;
  created_at?: string;
}

export const propertiesApi = {
  // 1. RÉCUPÉRER TOUS LES BIENS (Pour ton tableau PropertiesPage)
  async getAll(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/properties/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des biens");
    return response.json();
  },

  // 2. AJOUTER UN BIEN AVEC IA (Ton bouton magique)
  async addWithAI(formData: any) {
    const response = await fetch(`${API_BASE_URL}/properties/add-with-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        intent: formData.intent,
        price: parseFloat(formData.price),
        location: formData.location,
        neighborhood: formData.neighborhood || formData.location,
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area_sqm: parseInt(formData.area_sqm),
        // On fusionne les détails pour le champ 'description' de la DB (Point d'Excellence)
        features: `Staff: ${formData.staff_rooms || 'No'}, Parking: ${formData.parking || 'N/A'}, Security: ${formData.security || 'N/A'}, Access: ${formData.accessibility || 'N/A'}, Extra: ${formData.features || ''}`
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur serveur lors de l'ajout");
    }
    return response.json();
  },

  // 3. RÉCUPÉRER L'ARTICLE IA
  async getAIArticle(propertyId: string) {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/ai-article`);
    if (!response.ok) throw new Error("Article non trouvé");
    return response.json();
  }
};