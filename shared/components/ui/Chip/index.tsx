import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface ChipProps {
  label?: string;
  tx?: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: FeatherIconName;
  /** Shows a trailing clear affordance. */
  onRemove?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Selectable filter pill. Used by filter sheets and segmented lists. */
export default function Chip({
  label,
  tx,
  selected = false,
  onPress,
  icon,
  onRemove,
  disabled = false,
  style,
}: ChipProps) {
  const { colors } = useTheme();

  const body = (
    <>
      {!!icon && (
        <Feather name={icon} size={14} color={selected ? colors.onPrimary : colors.textSecondary} />
      )}
      <Text
        variant="labelSm"
        rawColor={selected ? colors.onPrimary : colors.textSecondary}
        tx={tx}
        numberOfLines={1}
      >
        {label}
      </Text>
      {!!onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} accessibilityRole="button">
          <Feather name="x" size={14} color={selected ? colors.onPrimary : colors.textMuted} />
        </Pressable>
      )}
    </>
  );

  const base: ViewStyle = {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: selected ? colors.primary : colors.surfaceAlt,
    borderColor: selected ? colors.primary : colors.border,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    columnGap: SPACING.xs,
    flexDirection: 'row',
    minHeight: 34,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  };

  if (!onPress) {
    return <View style={[base, style]}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        base,
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {body}
    </Pressable>
  );
}
