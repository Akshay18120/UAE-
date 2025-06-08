// This file provides centralized i18n utilities and constants
// The actual translations are managed in the useLanguage hook

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NAMES = {
  en: 'English',
  ar: 'العربية'
} as const;

export const RTL_LANGUAGES = ['ar'];

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language);
}

export function getLanguageDirection(language: string): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

// Format numbers based on locale
export function formatCurrency(amount: number, currency: string = 'AED', language: string = 'en'): string {
  const locale = language === 'ar' ? 'ar-AE' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(number: number, language: string = 'en'): string {
  const locale = language === 'ar' ? 'ar-AE' : 'en-US';
  
  return new Intl.NumberFormat(locale).format(number);
}

// Date formatting
export function formatDate(date: Date, language: string = 'en'): string {
  const locale = language === 'ar' ? 'ar-AE' : 'en-US';
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(date: Date, language: string = 'en'): string {
  const locale = language === 'ar' ? 'ar-AE' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffInDays) < 1) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    return rtf.format(diffInHours, 'hour');
  }
  
  return rtf.format(diffInDays, 'day');
}
