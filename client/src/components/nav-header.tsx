import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageToggle from "@/components/language-toggle";
import { useLanguage } from "@/hooks/use-language";
import { Menu, ChartLine } from "lucide-react";

export default function NavHeader() {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRTL = language === 'ar';

  const navigation = [
    { name: t('solutions'), href: '#solutions' },
    { name: t('pricing'), href: '#pricing' },
    { name: t('resources'), href: '#resources' },
    { name: t('about'), href: '#about' },
  ];

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 ${isRTL ? 'rtl' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-uae-blue to-uae-green rounded-lg flex items-center justify-center">
                <ChartLine className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-gray-900">CapitalFlow</span>
            </button>
            
            <div className="hidden md:block">
              <LanguageToggle />
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-uae-blue font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="hidden md:inline-flex text-gray-700 hover:text-uae-blue font-medium"
            >
              {t('signIn')}
            </Button>
            <Button 
              className="bg-uae-blue text-white hover:bg-blue-700 font-medium"
              onClick={() => setLocation("/application")}
            >
              {t('getStarted')}
            </Button>
            
            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <LanguageToggle />
                  
                  <div className="border-t pt-4">
                    <nav className="flex flex-col space-y-4">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="text-gray-700 hover:text-uae-blue font-medium transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                        </a>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('signIn')}
                    </Button>
                    <Button 
                      className="w-full justify-center bg-uae-blue hover:bg-blue-700"
                      onClick={() => {
                        setLocation("/application");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {t('getStarted')}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
