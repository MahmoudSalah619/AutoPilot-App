import React from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';

const LOGO_MARK = require('@/assets/images/auto-pilot.png');

export interface LogoProps {
  size?: number;
  /** Renders the wordmark beside the mark. */
  showWordmark?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The AutoPilot mark, optionally with the wordmark beside it. */
export default function Logo({ size = 48, showWordmark = false, style }: LogoProps) {
  const { colors } = useTheme();

  const mark = (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: colors.primarySoft,
        borderRadius: RADIUS.lg,
        height: size,
        justifyContent: 'center',
        overflow: 'hidden',
        width: size,
      }}
    >
      <Image
        source={LOGO_MARK}
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        style={{ height: size * 0.72, width: size * 0.72 }}
      />
    </View>
  );

  if (!showWordmark) {
    return <View style={style}>{mark}</View>;
  }

  return (
    <View style={[{ alignItems: 'center', columnGap: SPACING.sm, flexDirection: 'row' }, style]}>
      {mark}
      <Text variant="h1" size={size * 0.46}>
        AutoPilot
      </Text>
    </View>
  );
}
