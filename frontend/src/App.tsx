import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import About from "./pages/About";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Journal from "./pages/Journal";
import ArticleDetail from "./pages/ArticleDetail";
import Contact from "./pages/Contact";
import Investment from "./pages/Investment";
//import PricePrediction from "./pages/PricePrediction";
import NotFound from "./pages/NotFound";

// --- NOUVEAUX IMPORTS D'EXCELLENCE ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAIStudio from "./pages/admin/AdminAIStudio";
import PropertiesPage from './pages/admin/PropertiesPage';
import LeadsPage from './pages/admin/LeadsPage';
import BlogStudio from './pages/admin/BlogStudio';
import AdminLogin from "./pages/admin/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/investment" element={<Investment />} />
            
            {/* Admin routes */}
            {/* Remplace tes lignes admin par ce bloc groupé */}
            <Route path="/admin">
              <Route index element={<AdminDashboard />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="studio" element={<AdminAIStudio />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="blogs" element={<BlogStudio />} />
			  <Route path="/admin/login" element={<AdminLogin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;


