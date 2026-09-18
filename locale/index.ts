import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInstance, type LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';

import en from './en.json';
import ar from './ar.json';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

const STORAGE_KEY = 'autopilot.language';

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

function isSupported(value: unknown): value is AppLanguage {
  return SUPPORTED_LANGUAGES.includes(value as AppLanguage);
}

/** The device language, when we support it. */
function deviceLanguage(): AppLanguage {
  const code = Localization.getLocales()[0]?.languageCode;
  return isSupported(code) ? code : DEFAULT_LANGUAGE;
}

/**
 * Applies a language's writing direction and date locale.
 *
 * `I18nManager.forceRTL` only takes effect after a reload, so callers that
 * change language at runtime are responsible for prompting a restart — see
 * `useChangeLanguage`.
 */
export function applyLanguageSideEffects(language: AppLanguage) {
  const shouldBeRTL = language === 'ar';

  dayjs.locale(language);

  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    return true;
  }

  return false;
}

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  init: () => undefined,
  detect: (callback) => {
    // i18next expects `detect` itself to return void, so the async read runs
    // inside and reports back through the callback.
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        const language = isSupported(stored) ? stored : deviceLanguage();
        applyLanguageSideEffects(language);
        callback(language);
      })
      .catch(() => {
        applyLanguageSideEffects(DEFAULT_LANGUAGE);
        callback(DEFAULT_LANGUAGE);
      });
  },
  cacheUserLanguage: (language) => {
    AsyncStorage.setItem(STORAGE_KEY, language).catch(() => {});
  },
};

const i18n = createInstance();

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  });

export default i18n;
