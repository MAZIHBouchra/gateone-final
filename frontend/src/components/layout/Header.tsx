import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Home, Menu, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About Us', href: '/about' },
    { name: 'Properties', href: '/properties' },
    { name: 'Investment', href: '/investment' },
    { name: 'Journal', href: '/journal' },
    { name: 'Price Prediction', href: '/price-prediction' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <div className="w-4 h-4 bg-primary-foreground rounded-full"></div>
            </div>
            <span className="text-2xl font-playfair font-bold text-primary">GateOne</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                  isActive(item.href) 
                    ? 'text-primary border-b-2 border-primary pb-1' 
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-primary"
              />
              <Moon className="h-4 w-4" />
            </div>
            
            <Link to="/contact">
              <Button className="btn-primary">Contact Us</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="py-4 space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href) 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium">Dark Mode</span>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
              
              <div className="px-4 pt-2">
                <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                  <Button className="btn-primary w-full">Contact Us</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;