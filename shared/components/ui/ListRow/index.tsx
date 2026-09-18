import React from 'react';
import { I18nManager, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Text from '@/shared/components/ui/Text';
import type { ColorToken } from '@/constants/Colors';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface ListRowProps {
  icon?: FeatherIconName;
  /** Tints the leading icon and its circular backdrop. */
  iconTone?: ColorToken;
  iconBackground?: ColorToken;
  title?: string;
  titleTx?: string;
  subtitle?: string;
  subtitleTx?: string;
  /** Trailing content: a Badge, Switch, value text, anything. */
  right?: React.ReactNode;
  /** Shows the chevron affordance. Defaults to true when `onPress` is set. */
  showChevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Settings-style row: leading icon, title/subtitle, trailing slot.
 *
 * Used by Profile, notification preferences, privacy and help screens so they
 * are all literally the same component rather than six near-copies.
 */
export default function ListRow({
  icon,
  iconTone = 'primary',
  iconBackground = 'primarySoft',
  title,
  titleTx,
  subtitle,
  subtitleTx,
  right,
  showChevron,
  onPress,
  destructive = false,
  disabled = false,
  style,
  testID,
}: ListRowProps) {
  const { colors } = useTheme();
  const chevronVisible = showChevron ?? (Boolean(onPress) && !right);
  const titleColor: ColorToken = destructive ? 'danger' : 'text';

  const content = (
    <>
      {!!icon && (
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors[destructive ? 'dangerSoft' : iconBackground],
            borderRadius: RADIUS.md,
            height: 38,
            justifyContent: 'center',
            width: 38,
          }}
        >
          <Feather name={icon} size={18} color={colors[destructive ? 'danger' : iconTone]} />
        </View>
      )}

      <View style={{ flex: 1, rowGap: 2 }}>
        <Text variant="h3" color={titleColor} tx={titleTx} numberOfLines={1}>
          {title}
        </Text>
        {(!!subtitle || !!subtitleTx) && (
          <Text variant="caption" color="textSecondary" tx={subtitleTx} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>

      {right}

      {chevronVisible && (
        <Feather
          name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
          size={20}
          color={colors.textMuted}
        />
      )}
    </>
  );

  const base: ViewStyle = {
    alignItems: 'center',
    columnGap: SPACING.md,
    flexDirection: 'row',
    minHeight: 60,
    paddingVertical: SPACING.md,
  };

  if (!onPress) {
    return (
      <View testID={testID} style={[base, style]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        base,
        pressed && { opacity: 0.6 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}
