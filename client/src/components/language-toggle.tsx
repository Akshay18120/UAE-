import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium ${
          language === 'en' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-transparent'
        }`}
      >
        EN
      </Button>
      <Button
        variant={language === 'ar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1 text-sm font-medium arabic-text ${
          language === 'ar' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-transparent'
        }`}
      >
        العربية
      </Button>
    </div>
  );
}
