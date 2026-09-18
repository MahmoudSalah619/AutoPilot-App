import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';

import { applyLanguageSideEffects, type AppLanguage } from '@/locale';

/**
 * Switches the app language.
 *
 * Arabic flips the layout to RTL, and React Native only applies that after a
 * reload — so when the direction actually changes we surface a confirmation
 * rather than leaving the user on a half-mirrored screen.
 */
export function useChangeLanguage() {
  const { i18n } = useTranslation();
  const [isRestartRequired, setIsRestartRequired] = useState(false);

  const changeLanguage = useCallback(
    async (language: AppLanguage) => {
      if (language === i18n.language) return false;

      await i18n.changeLanguage(language);
      const directionChanged = applyLanguageSideEffects(language);

      setIsRestartRequired(directionChanged);
      return directionChanged;
    },
    [i18n]
  );

  const restart = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Reload is unavailable in Expo Go; the user can relaunch manually.
      setIsRestartRequired(false);
    }
  }, []);

  return {
    language: i18n.language as AppLanguage,
    changeLanguage,
    isRestartRequired,
    dismissRestart: () => setIsRestartRequired(false),
    restart,
  };
}

export default useChangeLanguage;
