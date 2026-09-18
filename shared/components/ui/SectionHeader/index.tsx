import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface SectionHeaderProps {
  titleTx: string;
  subtitleTx?: string;
  icon?: FeatherIconName;
  /** Trailing text action, e.g. "See all". */
  actionTx?: string;
  onAction?: () => void;
  /** Arbitrary trailing content, used instead of `actionTx` when given. */
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Title (plus optional subtitle and trailing action) above a group of content. */
export default function SectionHeader({
  titleTx,
  subtitleTx,
  icon,
  actionTx,
  onAction,
  right,
  style,
}: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          columnGap: SPACING.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      <View style={{ alignItems: 'center', columnGap: SPACING.sm, flexDirection: 'row', flex: 1 }}>
        {!!icon && <Feather name={icon} size={18} color={colors.primary} />}

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="h2" tx={titleTx} />
          {!!subtitleTx && <Text variant="caption" color="textSecondary" tx={subtitleTx} />}
        </View>
      </View>

      {right ??
        (!!actionTx && !!onAction ? (
          <Pressable
            onPress={onAction}
            hitSlop={8}
            accessibilityRole="button"
            style={({ pressed }) => [
              { alignItems: 'center', columnGap: 2, flexDirection: 'row' },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text variant="labelSm" color="primary" tx={actionTx} />
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </Pressable>
        ) : null)}
    </View>
  );
}
