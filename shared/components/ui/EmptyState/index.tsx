import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import Button from '@/shared/components/ui/Button';
import Text from '@/shared/components/ui/Text';
import type { FeatherIconName } from '@/shared/components/ui/IconButton';

export interface EmptyStateProps {
  icon?: FeatherIconName;
  titleTx: string;
  bodyTx?: string;
  /** Primary call to action. Omit for purely informational empties. */
  actionTx?: string;
  onAction?: () => void;
  /** Softer secondary action, rendered below the primary one. */
  secondaryActionTx?: string;
  onSecondaryAction?: () => void;
  /** `inline` removes the vertical centering, for use inside a card. */
  layout?: 'screen' | 'inline';
  style?: StyleProp<ViewStyle>;
}

/**
 * The single empty / zero-data treatment.
 *
 * Every list in the app routes through this so a first-run user sees one
 * consistent voice instead of six different improvised placeholders.
 */
export default function EmptyState({
  icon = 'inbox',
  titleTx,
  bodyTx,
  actionTx,
  onAction,
  secondaryActionTx,
  onSecondaryAction,
  layout = 'screen',
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          paddingHorizontal: SPACING.xl,
          rowGap: SPACING.md,
        },
        layout === 'screen' && { flex: 1, justifyContent: 'center', paddingVertical: SPACING.huge },
        layout === 'inline' && { paddingVertical: SPACING.xxl },
        style,
      ]}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.primarySoft,
          borderRadius: RADIUS.pill,
          height: 72,
          justifyContent: 'center',
          marginBottom: SPACING.xs,
          width: 72,
        }}
      >
        <Feather name={icon} size={30} color={colors.primary} />
      </View>

      <Text variant="h2" align="center" tx={titleTx} />

      {!!bodyTx && <Text variant="body" color="textSecondary" align="center" tx={bodyTx} />}

      {!!actionTx && !!onAction && (
        <Button tx={actionTx} onPress={onAction} style={{ marginTop: SPACING.sm }} />
      )}

      {!!secondaryActionTx && !!onSecondaryAction && (
        <Button variant="ghost" size="sm" tx={secondaryActionTx} onPress={onSecondaryAction} />
      )}
    </View>
  );
}
