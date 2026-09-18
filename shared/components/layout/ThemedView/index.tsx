import React from 'react';
import { View as RNView, type ViewProps } from 'react-native';

import { useTheme } from '@/theme';
import type { ColorToken } from '@/constants/Colors';

export interface ThemedViewProps extends ViewProps {
  /** Background color token. Defaults to the app background. */
  background?: ColorToken;
}

/** A `View` whose background follows the active theme. */
export default function ThemedView({ style, background = 'background', ...rest }: ThemedViewProps) {
  const { colors } = useTheme();

  return <RNView style={[{ backgroundColor: colors[background] }, style]} {...rest} />;
}
