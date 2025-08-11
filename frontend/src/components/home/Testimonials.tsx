import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import avatar1 from '@/assets/avatar-1.jpg';
import avatar2 from '@/assets/avatar-2.jpg';
import avatar3 from '@/assets/avatar-3.jpg';
import ceoAvatar from '@/assets/ceo-avatar.jpg';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "First-time Homebuyer",
      avatar: avatar1,
      rating: 5,
      content: "GateOne made my dream of homeownership a reality. Their team was incredibly patient and guided me through every step of the process. I couldn't be happier with my new home!",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Real Estate Investor",
      avatar: avatar2,
      rating: 5,
      content: "As an investor, I need agents who understand the market inside and out. GateOne consistently delivers exceptional properties and investment opportunities. Their market insights are invaluable.",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Family Relocating",
      avatar: avatar3,
      rating: 5,
      content: "Moving across the country with three kids was stressful, but GateOne made the house hunting process seamless. They found us the perfect family home in our ideal neighborhood.",
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Luxury Home Buyer",
      avatar: ceoAvatar,
      rating: 5,
      content: "The attention to detail and personalized service from GateOne exceeded all expectations. They understood exactly what we were looking for and delivered beyond our dreams.",
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Property Seller",
      avatar: avatar1,
      rating: 5,
      content: "Selling our home was stress-free thanks to GateOne's professional marketing and negotiation skills. They sold our property above asking price in just two weeks!",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      result.push(testimonials[index]);
    }
    return result;
  };

  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied clients have to say about their experience with GateOne
          </p>
        </div>

        <div className="relative">
          {/* Desktop View - 3 Cards */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {visibleTestimonials().map((testimonial, index) => (
              <Card key={`${testimonial.id}-${index}`} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-accent/30" />
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center space-x-3 pt-4 border-t border-border">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-primary">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Mobile View - 1 Card */}
          <div className="md:hidden">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-accent/30" />
                </div>
                
                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonials[currentIndex].content}"
                </p>
                
                <div className="flex items-center space-x-3 pt-4 border-t border-border">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-primary">{testimonials[currentIndex].name}</div>
                    <div className="text-sm text-muted-foreground">{testimonials[currentIndex].role}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="sm"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full"
            onClick={prevTestimonial}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full"
            onClick={nextTestimonial}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary w-8' : 'bg-primary/30'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;