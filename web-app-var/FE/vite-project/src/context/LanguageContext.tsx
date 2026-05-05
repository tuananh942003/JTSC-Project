import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import vi from '../i18n/vi';
import en from '../i18n/en';

type Lang = 'vi' | 'en';

const translations: Record<Lang, Record<string, unknown>> = { vi, en };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'vi' || saved === 'en') ? saved : 'vi';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[lang];
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return (value as string) ?? key;
  }, [lang]);

  const setLang = useCallback((newLang: Lang) => {
    if (translations[newLang]) {
      setLangState(newLang);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => prev === 'vi' ? 'en' : 'vi');
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLang must be used within a LanguageProvider');
  }
  return context;
}
