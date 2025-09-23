import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  FileText, 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  Users,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  articlesCount: number;
  propertiesCount: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ articlesCount: 0, propertiesCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    verifyAuthAndLoad();
  }, []);

  const verifyAuthAndLoad = async () => {
    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
      const meRes = await fetch(`${base}/api/admin/me`, { credentials: 'include' });
      const me = await meRes.json();
      if (!me.authenticated) {
        navigate('/adminlogin');
        return;
      }
      const statsRes = await fetch(`${base}/api/admin/stats`, { credentials: 'include' });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          articlesCount: data.articlesCount ?? 0,
          propertiesCount: data.propertiesCount ?? 0
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
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
      console.error('Erreur lors de la déconnexion:', error);
      navigate('/adminlogin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard Admin - GateOne Estate
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Articles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.articlesCount}</div>
                <p className="text-xs text-muted-foreground">Articles publiés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Propriétés</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.propertiesCount}</div>
                <p className="text-xs text-muted-foreground">Propriétés en vente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visiteurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">Ce mois-ci</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Croissance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12%</div>
                <p className="text-xs text-muted-foreground">Par rapport au mois dernier</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Articles Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Gestion des Articles
                </CardTitle>
                <CardDescription>
                  Créer, modifier et supprimer des articles de blog pour votre site immobilier.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/admin/articles')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Voir tous les articles
                </Button>
                <Button 
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/articles/add')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un article
                </Button>
              </CardContent>
            </Card>

            {/* Properties Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Gestion des Propriétés
                </CardTitle>
                <CardDescription>
                  Gérer votre catalogue de propriétés immobilières.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate('/admin/properties')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Voir toutes les propriétés
                </Button>
                <Button 
                  className="w-full justify-start"
                  onClick={() => navigate('/admin/properties/add')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une propriété
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Accès rapide aux fonctionnalités les plus utilisées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  Propriétés en vedette: 3
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  Articles récents: 2
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  Demandes de contact: 5
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
