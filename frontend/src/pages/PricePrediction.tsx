import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calculator, MapPin, Home } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/layout/ChatBot';

const PricePrediction = () => {
  const [prediction, setPrediction] = useState<number | null>(null);

  const handlePredict = () => {
    // Mock prediction calculation
    const randomPrice = Math.floor(Math.random() * 2000000) + 500000;
    setPrediction(randomPrice);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ChatBot />
      
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-primary mb-6">Price Prediction</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Get an instant estimate of your property's market value</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-playfair font-bold">Property Details</h2>
                <div className="space-y-4">
                  <Input placeholder="Property Address" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Bedrooms" type="number" />
                    <Input placeholder="Bathrooms" type="number" />
                  </div>
                  <Input placeholder="Square Footage" type="number" />
                  <Input placeholder="Year Built" type="number" />
                  <Button onClick={handlePredict} className="w-full btn-primary">
                    <Calculator className="w-4 h-4 mr-2" />
                    Get Price Estimate
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {prediction ? (
                  <Card className="p-6 bg-accent/10">
                    <h3 className="text-xl font-playfair font-semibold mb-4">Estimated Value</h3>
                    <div className="text-4xl font-playfair font-bold text-primary mb-4">
                      ${prediction.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">Based on current market conditions and comparable properties</p>
                  </Card>
                ) : (
                  <Card className="p-6 text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Enter property details to get your price estimate</p>
                  </Card>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricePrediction;