const API_BASE_URL = "http://localhost:8000/api";

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

const getAuthHeader = () => {
  const token = localStorage.getItem('gateone_token');
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const propertiesApi = {

  // ── CIRCUIT CLIENT (Index.tsx) — SANS token, route /public ──
  async getPublicCatalog(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/properties/public`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Catalog fetch error");
    return response.json();
  },

  // ── CIRCUIT ADMIN (Dashboard) — AVEC token, route / ──
  async getAll(): Promise<Property[]> {
    const response = await fetch(`${API_BASE_URL}/properties/`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    if (!response.ok) throw new Error("Unauthorized");
    return response.json();
  },

  // Alias pour le dashboard admin
  async getAllForAdmin(): Promise<Property[]> {
    return propertiesApi.getAll();
  },

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
    if (imageFile) data.append("image", imageFile);

    const response = await fetch(`${API_BASE_URL}/properties/add-with-ai`, {
      method: "POST",
      headers: { ...getAuthHeader() },
      body: data,
    });
    if (!response.ok) throw new Error("Failed to secure listing.");
    return response.json();
  },

  async getAIArticle(propertyId: string) {
  const response = await fetch(
    `${API_BASE_URL}/properties/${propertyId}/ai-article`,
    {
      headers: { ...getAuthHeader() }
    }
  );

  if (!response.ok) throw new Error("AI article error");
  return response.json();
  },

  async getSocialPosts(propertyId: string) {
    const response = await fetch(
      `${API_BASE_URL}/properties/${propertyId}/social-posts`,
      { headers: { ...getAuthHeader() } }
    );
    if (!response.ok) throw new Error("Social briefing not found");
    return response.json();
  },

  async getById(id: string) {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error("Asset not found");
    return res.json();
  },

  async update(id: string, formData: any) {
    return fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
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

  async syncAI(id: string, formData: any) {
    return fetch(`${API_BASE_URL}/properties/${id}/sync-ai`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(formData)
    });
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) throw new Error("Revocation denied.");
    return response.json();
  },
  
  // Dans propertiesApi, ajoutez :
async trackAction(clientId: string, action: string, propertyId: string) {
  const token = localStorage.getItem('gateone_token');
  const response = await fetch(`http://localhost:8000/api/leads/interaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      lead_id: clientId,
      action_type: action,
      property_id: propertyId
    })
  });
  if (!response.ok) throw new Error('Tracking failed');
  return response.json();
},
};

export const blogsApi = {
  async getPublished() {
    const response = await fetch(
      `${API_BASE_URL}/blogs/public/blogs`,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Blog fetch error");
    }

    return response.json();
  }
};

export const leadsApi = {
  async trackAction(leadId: string, action: string, propertyId?: string) {
    const token = localStorage.getItem('gateone_client_token');
    if (!token) return;

    return fetch(`${API_BASE_URL}/leads/interaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        lead_id: leadId,
        action_type: action,
        property_id: propertyId || null,
        duration_seconds: 30
      })
    });
  },
  
  
  async getAllLeads(): Promise<Lead[]> {
    const res = await fetch(`http://localhost:8000/api/leads/`, {
        headers: getAuthHeader()
    });
    if (!res.ok) throw new Error("Unauthorized access to leads intelligence.");
    return res.json();
  },
  
  async getLeadIntelligence(leadId: string) {
    const res = await fetch(`http://localhost:8000/api/leads/${leadId}/intelligence`, {
        headers: getAuthHeader()
    });
    return res.json();
  }
};