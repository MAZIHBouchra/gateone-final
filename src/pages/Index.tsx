import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';
import Hero from '@/components/home/Hero';
import PropertySearch from '@/components/home/PropertySearch';
import About from '@/components/home/About';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import Testimonials from '@/components/home/Testimonials';
import Journal from '@/components/home/Journal';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <PropertySearch />
      <About />
      <FeaturedProperties />
      <Testimonials />
      <Journal />
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Index;
