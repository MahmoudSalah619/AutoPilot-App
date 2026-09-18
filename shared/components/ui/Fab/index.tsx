import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RADIUS, SPACING } from '@/constants/Layout';
import { TAB_BAR_HEIGHT } from '@/constants/Metrics';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface FabProps {
  icon?: FeatherIconName;
  /** Turns the FAB into an extended pill with a label beside the icon. */
  labelTx?: string;
  onPress: () => void;
  accessibilityLabel: string;
  /** Adds clearance for the tab bar. Off for screens pushed above the tabs. */
  aboveTabBar?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Floating primary action.
 *
 * Positions itself against the safe-area inset (and the tab bar when present)
 * instead of the hardcoded `bottom: 84` the screens each used to guess at.
 */
export default function Fab({
  icon = 'plus',
  labelTx,
  onPress,
  accessibilityLabel,
  aboveTabBar = true,
  disabled = false,
  style,
  testID,
}: FabProps) {
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();

  const bottom =
    SPACING.lg +
    (aboveTabBar ? TAB_BAR_HEIGHT + insets.bottom : Math.max(insets.bottom, SPACING.lg));

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          backgroundColor: colors.primary,
          borderRadius: RADIUS.pill,
          bottom,
          columnGap: SPACING.sm,
          end: SPACING.lg,
          flexDirection: 'row',
          height: 56,
          justifyContent: 'center',
          paddingHorizontal: labelTx ? SPACING.xl : 0,
          position: 'absolute',
          width: labelTx ? undefined : 56,
          ...elevation.lg(),
        },
        pressed && { opacity: 0.88, transform: [{ scale: 0.96 }] },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Feather name={icon} size={24} color={colors.onPrimary} />
      {!!labelTx && <Text variant="label" rawColor={colors.onPrimary} tx={labelTx} />}
    </Pressable>
  );
}
