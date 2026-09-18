import { useMemo } from 'react';

import FontFamily from '@/constants/FontFamily';
import { useTheme } from '@/theme';

/**
 * Theme object for `react-native-calendars`.
 *
 * The library predates the app's token system and takes a flat style bag, so
 * this is the one place we translate tokens into its shape — rather than every
 * calendar instance hardcoding its own hexes, as they did before.
 */
export function useCalendarTheme() {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      calendarBackground: colors.transparent,
      backgroundColor: colors.transparent,

      textSectionTitleColor: colors.textMuted,
      dayTextColor: colors.text,
      textDisabledColor: colors.textDisabled,
      monthTextColor: colors.text,

      todayTextColor: colors.primary,
      selectedDayBackgroundColor: colors.primary,
      selectedDayTextColor: colors.onPrimary,

      arrowColor: colors.primary,
      disabledArrowColor: colors.textDisabled,
      indicatorColor: colors.primary,
      dotColor: colors.primary,
      selectedDotColor: colors.onPrimary,

      textDayFontFamily: FontFamily.cosmica_400,
      textMonthFontFamily: FontFamily.cosmica_600,
      textDayHeaderFontFamily: FontFamily.cosmica_600,
      textDayFontSize: 15,
      textMonthFontSize: 17,
      textDayHeaderFontSize: 12,
    }),
    [colors]
  );
}

export default useCalendarTheme;
