/**
 * i18n Configuration
 *
 * This file initializes i18next for multi-language support
 * Supports English (en) and Hindi (hi)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import hiTranslation from './locales/hi/translation.json';

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en';

// Configure i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      hi: {
        translation: hiTranslation,
      },
    },
    lng: savedLanguage, // Default language from localStorage
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
  });

export default i18n;
