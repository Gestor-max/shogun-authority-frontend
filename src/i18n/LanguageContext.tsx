import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, TranslationSchema } from './types';
import { en } from './locales/en';
import { es } from './locales/es';

const dictionaries: Record<SupportedLanguage, TranslationSchema> = {
  en,
  es,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'shogun_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') {
      return saved;
    }
    // Default language is English
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const t = dictionaries[language] || dictionaries.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
