import { translations } from './translations.js';

let currentLocale = 'en';

export function setGlobalLocale(locale) {
  if (translations[locale]) {
    currentLocale = locale;
  }
}

export function getGlobalTranslation(key) {
  const keys = key.split('.');
  let value = translations[currentLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return null;
    }
  }
  
  return value;
}

export function t(key) {
  return getGlobalTranslation(key) || key;
}

// Initialize from localStorage if available
if (typeof window !== 'undefined' && window.localStorage) {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && translations[savedLocale]) {
    currentLocale = savedLocale;
  }
}
