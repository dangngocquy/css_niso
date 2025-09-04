import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import languageDetector from 'i18next-browser-languagedetector';

import translationVI from './data/locales/vi/translation.json';
import translationEN from './data/locales/en/translation.json';
import translationKH from './data/locales/kh/translation.json';

const resources = {
  vi: {
    translation: translationVI
  },
  en: {
    translation: translationEN
  },
  kh: {
    translation: translationKH
  }
};

i18n
  .use(Backend)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    backend: {
      loadPath: '/data/locales/{{lng}}/{{ns}}.json',
      reloadInterval: false
    }
  });

export const updateTranslations = async (newTranslations) => {
  Object.keys(newTranslations).forEach(lang => {
    i18n.addResourceBundle(lang, 'translation', newTranslations[lang], true, true);
  });
  
  await i18n.reloadResources(i18n.language);
};

export const changeLanguage = async (language) => {
  await i18n.changeLanguage(language);
};

export default i18n;
