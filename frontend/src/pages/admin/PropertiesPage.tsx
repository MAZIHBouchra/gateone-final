import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout'; // On retire les ../.. car ils sont voisins
import { propertiesApi, Property } from '../../lib/api'; // On remonte de deux crans pour aller dans lib
import { Home, MapPin } from 'lucide-react';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await propertiesApi.getAll();
        setProperties(data);
      } catch (error) {
        console.error("Erreur chargement propriétés:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#2D3321]">Portefeuille Immobilier</h1>
        <p className="text-gray-500">Gérez vos annonces et les contenus générés par l'IA.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <p>Chargement des propriétés...</p>
        ) : properties.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400">Aucune propriété trouvée. Utilisez l'AI Studio pour en ajouter une.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F9F7F2] text-[10px] uppercase tracking-widest text-gray-400">
                <tr>
                  <th className="px-6 py-4 text-left">Bien</th>
                  <th className="px-6 py-4 text-left">Localisation</th>
                  <th className="px-6 py-4 text-left">Prix</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#2D3321]/10 p-2 rounded-lg text-[#2D3321]">
                          <Home size={18} />
                        </div>
                        <span className="font-bold text-[#2D3321]">{prop.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-1">
                      <MapPin size={14} /> {prop.location}
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-[#C7A987]">
                      {prop.price.toLocaleString()} MAD
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold uppercase tracking-widest text-[#2D3321] hover:underline">
                        Voir l'article IA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}