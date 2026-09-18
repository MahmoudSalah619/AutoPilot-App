import React from 'react';
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native';

import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';

export interface LoadingProps {
  /** `screen` fills the available space; `inline` hugs its content. */
  layout?: 'screen' | 'inline';
  size?: 'small' | 'large';
  labelTx?: string;
  style?: StyleProp<ViewStyle>;
}

/** Centered activity indicator with an optional caption. */
export default function Loading({
  layout = 'screen',
  size = 'large',
  labelTx,
  style,
}: LoadingProps) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="progressbar"
      style={[
        { alignItems: 'center', justifyContent: 'center', rowGap: SPACING.md },
        layout === 'screen' && { flex: 1, padding: SPACING.xxl },
        layout === 'inline' && { paddingVertical: SPACING.xl },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={colors.primary} />
      {!!labelTx && <Text variant="bodySm" color="textMuted" tx={labelTx} />}
    </View>
  );
}
