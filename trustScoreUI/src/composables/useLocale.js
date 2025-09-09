import { ref, computed } from 'vue';
import { translations, availableLocales, getScoreTranslation } from '../utils/translations.js';
import { useStorage } from '../components/useStorage.js';

const currentLocale = ref('en');

export function useLocale() {
  const { getStorage, updateStorage } = useStorage('local');
  
  // Initialize locale from storage
  const savedLocale = getStorage('locale');
  if (savedLocale && translations[savedLocale]) {
    currentLocale.value = savedLocale;
  }
  
  const setLocale = (locale) => {
    if (translations[locale]) {
      currentLocale.value = locale;
      updateStorage('locale', locale);
    }
  };
  
  const getTranslation = (key) => {
    const keys = key.split('.');
    let value = translations[currentLocale.value];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return null;
      }
    }
    
    return value;
  };
  
  const t = (key) => {
    return getTranslation(key) || key;
  };
  
  const getScoreLabel = (category, key) => {
    return getScoreTranslation(currentLocale.value, category, key);
  };
  
  return {
    currentLocale: computed(() => currentLocale.value),
    availableLocales,
    setLocale,
    getTranslation,
    t,
    getScoreLabel
  };
}
