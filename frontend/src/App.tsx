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
import PricePrediction from "./pages/PricePrediction";
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
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/investment" element={<Investment />} />
            <Route path="/price-prediction" element={<PricePrediction />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
