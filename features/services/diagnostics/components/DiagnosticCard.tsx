import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { DiagnosticCode, DiagnosticSeverity } from '@/@types/models';
import { Badge, Card, Text, type BadgeTone } from '@/shared/components/ui';

export const SEVERITY_TONE: Record<DiagnosticSeverity, BadgeTone> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

export interface DiagnosticCardProps {
  entry: DiagnosticCode;
  onPress: () => void;
}

/**
 * Search result for a fault code.
 *
 * Leads with the code itself in a monospace-weight block, because the user
 * typically has it written down and is scanning for an exact match.
 */
export default function DiagnosticCard({ entry, onPress }: DiagnosticCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Card onPress={onPress} padding="lg" style={{ rowGap: SPACING.md }}>
      <View style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.surfaceAlt,
            borderRadius: RADIUS.sm,
            justifyContent: 'center',
            minWidth: 64,
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
          }}
        >
          <Text variant="metricSm">{entry.code}</Text>
        </View>

        <View style={{ flex: 1, rowGap: 2 }}>
          <Text variant="h3" numberOfLines={2}>
            {entry.title}
          </Text>
          <Text variant="caption" color="textMuted">
            {t(`errorsGuide.systems.${entry.system}`)}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'center', columnGap: SPACING.sm, flexDirection: 'row' }}>
        <Badge
          tone={SEVERITY_TONE[entry.severity]}
          tx={`errorsGuide.severities.${entry.severity}`}
          size="sm"
          withDot
        />

        <View style={{ alignItems: 'center', columnGap: SPACING.xs, flexDirection: 'row' }}>
          <Feather
            name={entry.safeToDrive ? 'check-circle' : 'alert-octagon'}
            size={14}
            color={entry.safeToDrive ? colors.success : colors.danger}
          />
          <Text
            variant="caption"
            color={entry.safeToDrive ? 'success' : 'danger'}
            tx={entry.safeToDrive ? 'errorsGuide.safeToDrive' : 'errorsGuide.notSafeToDrive'}
          />
        </View>
      </View>
    </Card>
  );
}
