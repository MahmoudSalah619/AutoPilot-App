import React, { useMemo } from 'react';
import { I18nManager, Text as RNText, type TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TYPOGRAPHY, WEIGHT_TO_FAMILY } from '@/constants/Typography';
import { useTheme } from '@/theme';
import type { TextProps } from './types';

/**
 * The only text primitive in the app.
 *
 * Translation is opt-in through `tx` — anything passed as `children` is
 * rendered verbatim, which is what you want for user data (vehicle names,
 * odometer readings, dates).
 *
 * @example
 * <Text variant="h2" tx="vehicle.yourVehicle" />
 * <Text variant="metric" color="primary">{`${efficiency} km/L`}</Text>
 */
export default function Text({
  variant = 'body',
  color = 'text',
  rawColor,
  align,
  size,
  weight,
  lineHeight,
  tx,
  txValues,
  muted = false,
  style,
  children,
  ...rest
}: TextProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const resolvedStyle = useMemo<TextStyle>(() => {
    const base = TYPOGRAPHY[variant] as TextStyle;

    return {
      ...base,
      color: rawColor ?? colors[muted ? 'textMuted' : color],
      ...(size !== undefined && { fontSize: size }),
      ...(weight !== undefined && { fontFamily: WEIGHT_TO_FAMILY[weight] }),
      ...(lineHeight !== undefined && { lineHeight }),
      ...(align !== undefined && { textAlign: align }),
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    };
  }, [variant, color, rawColor, muted, size, weight, lineHeight, align, colors]);

  return (
    <RNText style={[resolvedStyle, style]} {...rest}>
      {tx ? (t(tx, txValues ?? {}) as string) : children}
    </RNText>
  );
}
