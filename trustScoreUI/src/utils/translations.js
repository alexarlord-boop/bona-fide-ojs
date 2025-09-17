import en from '../translations/en.json';
import es from '../translations/es.json';
import fr from '../translations/fr.json';
import de from '../translations/de.json';
import zh from '../translations/zh.json';

export const translations = {
  en,
  es,
  fr,
  de,
  zh,
};

export const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: 'Simplified Mandarin Chinese' }
];

export function getTranslation(locale, key) {
  const keys = key.split('.');
  let value = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return null;
    }
  }
  
  return value;
}

export function getScoreTranslation(locale, category, key) {
  return getTranslation(locale, `scores.${category}.${key}`) || key;
}
