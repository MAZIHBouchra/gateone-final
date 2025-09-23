import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LayoutDashboard, 
  FileText, 
  Save, 
  ArrowLeft,
  LogOut,
  Loader2
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  tags: string[];
  date: string;
}

const AdminEditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    category: '',
    tags: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const categories = [
    'Immobilier',
    'Investissement',
    'Marché',
    'Conseils',
    'Actualités',
    'Guide',
    'Tendances'
  ];

  useEffect(() => {
    if (id) {
      fetchArticle(parseInt(id));
    }
  }, [id]);

  const fetchArticle = async (articleId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/articles`);
      if (response.ok) {
        const articles = await response.json();
        const foundArticle = articles.find((a: Article) => a.id === articleId);
        
        if (foundArticle) {
          setArticle(foundArticle);
          setFormData({
            title: foundArticle.title,
            content: foundArticle.content,
            excerpt: foundArticle.excerpt,
            image: foundArticle.image,
            category: foundArticle.category,
            tags: foundArticle.tags.join(', ')
          });
        } else {
          setError('Article non trouvé');
        }
      }
    } catch (error) {
      setError('Erreur lors du chargement de l\'article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('image', formData.image);
      submitData.append('category', formData.category);
      submitData.append('tags', formData.tags);

      const response = await fetch(`http://127.0.0.1:8000/admin/articles/edit/${id}`, {
        method: 'POST',
        body: submitData,
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Article modifié avec succès !');
        setTimeout(() => {
          navigate('/admin/articles');
        }, 2000);
      } else {
        setError('Erreur lors de la modification de l\'article');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/adminlogin');
    } catch (error) {
      navigate('/adminlogin');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article non trouvé</h2>
          <Button onClick={() => navigate('/admin/articles')}>
            Retour aux articles
          </Button>
        </div>
      </div>
    );
  }

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
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/articles')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Articles
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Modifier l'Article
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Modifier l'Article #{article.id}
              </CardTitle>
              <CardDescription>
                Modifiez les informations de cet article.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Titre */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'article *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Entrez le titre de l'article"
                    required
                  />
                </div>

                {/* Extrait */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Extrait *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Résumé court de l'article (2-3 phrases)"
                    rows={3}
                    required
                  />
                </div>

                {/* Contenu */}
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu de l'article *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Rédigez le contenu complet de votre article..."
                    rows={12}
                    required
                  />
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label htmlFor="image">URL de l'image *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="/images/article-example.jpg"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Utilisez une URL relative comme /images/nom-image.jpg
                  </p>
                </div>

                {/* Catégorie */}
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="immobilier, investissement, marrakech (séparés par des virgules)"
                  />
                  <p className="text-sm text-gray-500">
                    Séparez les tags par des virgules
                  </p>
                </div>

                {/* Messages */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Boutons */}
                <div className="flex space-x-4 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Modification en cours...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Modifier l'article
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/admin/articles')}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminEditArticle;
