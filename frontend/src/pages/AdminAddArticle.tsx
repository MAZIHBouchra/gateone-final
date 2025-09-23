import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ImageUpload from '@/components/ui/image-upload';
import {
  LayoutDashboard,
  FileText,
  Save,
  ArrowLeft,
  LogOut,
  Loader2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Quote,
  Palette,
  Search,
  TrendingUp,
  Eye,
  Upload
} from 'lucide-react';

const RichTextEditor: React.FC<{ value: string; onChange: (html: string) => void; placeholder?: string; }>
  = ({ value, onChange, placeholder = "Rédigez votre contenu ici..." }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isEditorReady) {
      editorRef.current.innerHTML = value || '';
      setIsEditorReady(true);
    }
  }, [value, isEditorReady]);

  const executeCommand = (command: string, val?: string) => {
    document.execCommand(command, false, val ?? null);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = window.prompt("Entrez l'URL du lien:");
    if (url) executeCommand('createLink', url);
  };

  const insertImage = () => {
    const url = window.prompt("Entrez l'URL de l'image:");
    if (url) executeCommand('insertImage', url);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="border-b border-border p-2 bg-muted/30">
        <div className="flex flex-wrap items-center gap-1">
          <select
            onChange={(e) => executeCommand('fontSize', e.target.value)}
            className="px-2 py-1 text-xs border border-border rounded bg-background"
            title="Taille de police"
          >
            <option value="">Taille</option>
            <option value="1">Très petit</option>
            <option value="2">Petit</option>
            <option value="3">Normal</option>
            <option value="4">Grand</option>
            <option value="5">Très grand</option>
            <option value="6">Énorme</option>
          </select>
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            className="px-2 py-1 text-xs border border-border rounded bg-background ml-1"
            title="Style"
          >
            <option value="">Style</option>
            <option value="h1">Titre 1</option>
            <option value="h2">Titre 2</option>
            <option value="h3">Titre 3</option>
            <option value="h4">Titre 4</option>
            <option value="p">Paragraphe</option>
          </select>
          <div className="w-px h-6 bg-border mx-1"></div>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('bold')} className="p-1 h-8 w-8" title="Gras"><Bold className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('italic')} className="p-1 h-8 w-8" title="Italique"><Italic className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('underline')} className="p-1 h-8 w-8" title="Souligné"><Underline className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('justifyLeft')} className="p-1 h-8 w-8" title="Aligner à gauche"><AlignLeft className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('justifyCenter')} className="p-1 h-8 w-8" title="Centrer"><AlignCenter className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('justifyRight')} className="p-1 h-8 w-8" title="Aligner à droite"><AlignRight className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('insertUnorderedList')} className="p-1 h-8 w-8" title="Liste à puces"><List className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('insertOrderedList')} className="p-1 h-8 w-8" title="Liste numérotée"><ListOrdered className="w-4 h-4" /></Button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('foreColor', window.prompt('Couleur (ex: #ff0000)') || undefined)} className="p-1 h-8 w-8" title="Couleur du texte"><Palette className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertLink} className="p-1 h-8 w-8" title="Insérer un lien"><Link2 className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={insertImage} className="p-1 h-8 w-8" title="Insérer une image"><ImageIcon className="w-4 h-4" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => executeCommand('formatBlock', 'blockquote')} className="p-1 h-8 w-8" title="Citation"><Quote className="w-4 h-4" /></Button>
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onBlur={handleContentChange}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none rich-text-content"
        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        data-placeholder={placeholder}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        [contentEditable]:empty:before { content: attr(data-placeholder); color: hsl(var(--muted-foreground)); font-style: italic; }
        [contentEditable]:focus:before { content: none; }
        .rich-text-content h1{font-size:2em;font-weight:bold;margin:.5em 0}
        .rich-text-content h2{font-size:1.5em;font-weight:bold;margin:.5em 0}
        .rich-text-content p{margin:.5em 0;line-height:1.6}
      ` }} />
    </div>
  );
};

const SEOAnalyzer: React.FC<{ formData: any }> = ({ formData }) => {
  const scoreCalc = () => {
    let score = 0; const factors: { type: 'success'|'warning'|'error'; text: string }[] = [];
    if (formData.seoTitle) {
      if (formData.seoTitle.length >= 30 && formData.seoTitle.length <= 60) { score += 20; factors.push({type:'success', text:'Titre SEO optimal (30-60)'}); }
      else { factors.push({type:'warning', text:`Titre SEO: ${formData.seoTitle.length} caractères`}); }
    } else { factors.push({type:'error', text:'Titre SEO manquant'}); }
    if (formData.metaDescription) {
      if (formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160) { score += 20; factors.push({type:'success', text:'Meta description optimale (120-160)'}); }
      else { factors.push({type:'warning', text:`Meta description: ${formData.metaDescription.length} caractères`}); }
    } else { factors.push({type:'error', text:'Meta description manquante'}); }
    if (formData.slug) { score += 15; factors.push({type:'success', text:'URL personnalisée définie'}); } else { factors.push({type:'warning', text:'URL personnalisée recommandée'}); }
    if (formData.focusKeyword) {
      score += 15; factors.push({type:'success', text:'Mot-clé principal défini'});
      if (formData.seoTitle?.toLowerCase().includes(formData.focusKeyword.toLowerCase())) { score += 10; factors.push({type:'success', text:'Mot-clé dans le titre SEO'}); }
      if (formData.metaDescription?.toLowerCase().includes(formData.focusKeyword.toLowerCase())) { score += 10; factors.push({type:'success', text:'Mot-clé dans la meta description'}); }
    } else { factors.push({type:'error', text:'Mot-clé principal manquant'}); }
    if (formData.image && formData.imageAlt) { score += 10; factors.push({type:'success', text:'Image avec alt défini'}); }
    return { score, factors };
  };
  const { score, factors } = scoreCalc();
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Correct' : score >= 40 ? 'À améliorer' : 'Insuffisant';
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Score SEO</h4>
        <div className="flex items-center space-x-2">
          <span className={`font-bold ${scoreColor}`}>{score}/100</span>
          <span className="text-sm text-muted-foreground">({scoreLabel})</span>
        </div>
      </div>
      <div className="h-2 w-full bg-muted rounded overflow-hidden">
        <div className="h-2 bg-primary" style={{ width: `${score}%` }} />
      </div>
      <div className="space-y-2">
        {factors.map((f, i) => (
          <div key={i} className="text-sm text-muted-foreground">• {f.text}</div>
        ))}
      </div>
    </div>
  );
};

const AdminAddArticle: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image: '',
    category: '',
    tags: '',
    // SEO fields
    seoTitle: '',
    metaDescription: '',
    slug: '',
    focusKeyword: '',
    imageAlt: ''
  });
  const [isLoading, setIsLoading] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value } as any;
      if (field === 'title' && !prev.slug) {
        const autoSlug = value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        next.slug = autoSlug;
        if (!prev.seoTitle) {
          next.seoTitle = value.length <= 60 ? value : value.slice(0, 57) + '...';
        }
      }
      return next;
    });
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const base = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
      const response = await fetch(`${base}/api/admin/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (response.ok || response.status === 302) {
        setSuccess('Article ajouté avec succès !');
        setTimeout(() => {
          navigate('/admin/articles');
        }, 2000);
      } else {
        setError('Erreur lors de l\'ajout de l\'article');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
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
                Ajouter un Article
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
                Nouvel Article
              </CardTitle>
              <CardDescription>
                Créez un nouvel article pour votre blog immobilier.
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

                {/* Contenu avec éditeur riche */}
                <div className="space-y-2">
                  <Label htmlFor="content">Contenu de l'article *</Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) => handleInputChange('content', html)}
                    placeholder="Rédigez le contenu complet de votre article..."
                  />
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label>Image de l'article *</Label>
                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    currentImage={formData.image ? `${(import.meta.env.VITE_API_BASE_URL ?? window.location.origin)}${formData.image}` : undefined}
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

                {/* SEO Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Search className="h-5 w-5 mr-2" />
                      Optimisation SEO
                    </CardTitle>
                    <CardDescription>
                      Renseignez les champs SEO pour améliorer la visibilité de votre article.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="seoTitle">Titre SEO</Label>
                      <Input
                        id="seoTitle"
                        value={formData.seoTitle}
                        maxLength={60}
                        onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                        placeholder="Titre optimisé (30-60 caractères)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{formData.seoTitle.length}/60 caractères</p>
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        rows={3}
                        value={formData.metaDescription}
                        onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                        placeholder="Résumé pour l'aperçu des moteurs de recherche (120-160 caractères)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{formData.metaDescription.length}/160 caractères</p>
                    </div>
                    <div>
                      <Label htmlFor="slug">URL (slug)</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">monsite.com/</span>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => handleInputChange('slug', e.target.value)}
                          placeholder="url-de-l-article"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="focusKeyword">Mot-clé principal</Label>
                      <Input
                        id="focusKeyword"
                        value={formData.focusKeyword}
                        onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                        placeholder="immobilier luxe, investissement..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageAlt">Texte alternatif de l'image (Alt)</Label>
                      <Input
                        id="imageAlt"
                        value={formData.imageAlt}
                        onChange={(e) => handleInputChange('imageAlt', e.target.value)}
                        placeholder="Description de l'image pour l'accessibilité et le SEO"
                      />
                    </div>

                    {/* SEO Analyzer */}
                    <div className="pt-2">
                      <SEOAnalyzer formData={formData} />
                    </div>
                  </CardContent>
                </Card>

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
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ajout en cours...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Ajouter l'article
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

export default AdminAddArticle;
