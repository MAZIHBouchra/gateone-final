import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Search,
  Calendar,
  Tag
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  tags: string[];
  date: string;
  created_at: string;
  updated_at: string;
}

const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    verifyAuthAndFetch();
  }, []);

  const verifyAuthAndFetch = async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
      const meRes = await fetch(`${base}/api/admin/me`, { credentials: 'include' });
      const me = await meRes.json();
      if (!me.authenticated) {
        navigate('/adminlogin');
        return;
      }
      const response = await fetch(`${base}/api/articles`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
        const response = await fetch(`${base}/admin/articles/delete/${id}`, {
          method: 'POST',
          credentials: 'include'
        });
        if (response.ok) {
          setArticles(articles.filter(article => article.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
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

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-xl font-semibold text-gray-900">
                Gestion des Articles
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Actions Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher des articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button onClick={() => navigate('/admin/articles/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un article
            </Button>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="text-center py-8">Chargement des articles...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="aspect-video bg-gray-200 rounded-md mb-3 overflow-hidden">
                      <img 
                        src={(article.image && (article.image.startsWith('http') ? article.image : `${(import.meta.env.VITE_API_BASE_URL ?? window.location.origin)}${article.image}`)) || ''} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `${(import.meta.env.VITE_API_BASE_URL ?? window.location.origin)}/api/placeholder/400/200`;
                        }}
                      />
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(article.date).toLocaleDateString('fr-FR')}
                        </div>
                        <Badge variant="secondary">{article.category}</Badge>
                      </div>
                      
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex items-center flex-wrap gap-1">
                          <Tag className="h-3 w-3 text-gray-400" />
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{article.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredArticles.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun article</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer votre premier article.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/admin/articles/add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un article
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminArticles;
