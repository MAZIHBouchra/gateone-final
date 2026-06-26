import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";

// --- 1. CLIENT-FACING PAGES (PUBLIC JOURNEY) ---
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Properties from "./pages/Properties";           // Ta nouvelle grille de recherche client
import PropertyDetail from "./pages/PropertyDetail";   // Ta nouvelle fiche villa IA
import Journal from "./pages/Journal";                 // Ton nouveau blog public
import ArticleDetail from "./pages/ArticleDetail";     // Lecture individuelle d'un blog expert
import ClientSignup from './pages/ClientSignup';
import ClientLogin from './pages/ClientLogin';
import ClientForgotPassword from './pages/ClientForgotPassword';

// --- 2. AGENT-FACING PAGES (ADMIN PORTAL) ---
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAIStudio from "./pages/admin/AdminAIStudio";
import PropertiesPage from './pages/admin/PropertiesPage';
import LeadsPage from './pages/admin/LeadsPage';
import BlogStudio from './pages/admin/BlogStudio';
import AdminEditProperty from './pages/admin/AdminEditProperty';
import SettingsPage from './pages/admin/SettingsPage';


// Fallback Page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* --- PUBLIC ECOSYSTEM --- */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
			<Route path="/investor/signup" element={<ClientSignup />} />
			<Route path="/client/login" element={<ClientLogin />} />
			<Route path="/client/forgot-password" element={<ClientForgotPassword />} />
            
            {/* --- SECURE ADMIN PORTAL --- */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/properties" element={<PropertiesPage />} />
            <Route path="/admin/studio" element={<AdminAIStudio />} />
            <Route path="/admin/leads" element={<LeadsPage />} />
            <Route path="/admin/blogs" element={<BlogStudio />} />
			<Route path="/admin/edit/:id" element={<AdminEditProperty />} />
			<Route path="/admin/settings" element={<SettingsPage />} />

            {/* --- ERROR CATCH --- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;