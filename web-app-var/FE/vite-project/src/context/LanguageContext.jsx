import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import vi from '../i18n/vi';
import en from '../i18n/en';

const translations = { vi, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('lang');
    return saved || 'vi';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value ?? key;
  }, [lang]);

  const setLang = useCallback((newLang) => {
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

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLang must be used within a LanguageProvider');
  }
  return context;
}
