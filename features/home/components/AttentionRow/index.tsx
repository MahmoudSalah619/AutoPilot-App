import React from 'react';
import { I18nManager, Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { Badge, Text } from '@/shared/components/ui';
import type { AttentionItem } from '@/features/home/hooks/useAttentionItems';

const TONE_SOFT = {
  danger: 'dangerSoft',
  warning: 'warningSoft',
  primary: 'primarySoft',
  success: 'successSoft',
  info: 'infoSoft',
  neutral: 'surfaceAlt',
} as const;

const TONE_FG = {
  danger: 'danger',
  warning: 'warning',
  primary: 'primary',
  success: 'success',
  info: 'info',
  neutral: 'textMuted',
} as const;

/** One row in the home screen's "needs your attention" list. */
export default function AttentionRow({
  item,
  onPress,
}: {
  item: AttentionItem;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          alignItems: 'center',
          columnGap: SPACING.md,
          flexDirection: 'row',
          paddingVertical: SPACING.md,
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors[TONE_SOFT[item.tone]],
          borderRadius: RADIUS.md,
          height: 38,
          justifyContent: 'center',
          width: 38,
        }}
      >
        <Feather name={item.icon} size={17} color={colors[TONE_FG[item.tone]]} />
      </View>

      <View style={{ flex: 1, rowGap: 2 }}>
        <Text variant="h3" numberOfLines={1}>
          {item.title}
        </Text>
        <Text variant="caption" color={TONE_FG[item.tone]}>
          {t(item.detailTx, item.detailValues ?? {}) as string}
        </Text>
      </View>

      <Badge tone={item.tone} tx={item.statusTx} size="sm" />

      <Feather
        name={I18nManager.isRTL ? 'chevron-left' : 'chevron-right'}
        size={18}
        color={colors.textMuted}
      />
    </Pressable>
  );
}
