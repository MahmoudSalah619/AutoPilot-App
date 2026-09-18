import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { DiagnosticCode } from '@/@types/models';
import { Sheet } from '@/shared/components/layout';
import { Badge, Button, Divider, Text } from '@/shared/components/ui';
import { SEVERITY_TONE } from './DiagnosticCard';

export interface DiagnosticDetailSheetProps {
  entry?: DiagnosticCode;
  onClose: () => void;
  /** Creates a maintenance record pre-filled from this fault. */
  onLogService?: () => void;
}

/** Bulleted list with the fault's accent color. */
function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <View style={{ rowGap: SPACING.sm }}>
      {items.map((item) => (
        <View key={item} style={{ columnGap: SPACING.sm, flexDirection: 'row' }}>
          <View
            style={{
              backgroundColor: color,
              borderRadius: RADIUS.pill,
              height: 6,
              marginTop: 7,
              width: 6,
            }}
          />
          <Text variant="bodySm" color="textSecondary" style={{ flex: 1 }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Full explanation of one OBD-II fault code. */
export default function DiagnosticDetailSheet({
  entry,
  onClose,
  onLogService,
}: DiagnosticDetailSheetProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (!entry) {
    return null;
  }

  const driveTone = entry.safeToDrive ? colors.warning : colors.danger;
  const driveBg = entry.safeToDrive ? colors.warningSoft : colors.dangerSoft;

  return (
    <Sheet
      isVisible={Boolean(entry)}
      onClose={onClose}
      maxHeightRatio={0.92}
      footer={
        onLogService ? (
          <Button tx="maintenance.logService" fullWidth onPress={onLogService} />
        ) : undefined
      }
    >
      <View style={{ rowGap: SPACING.md }}>
        <View style={{ alignItems: 'center', columnGap: SPACING.md, flexDirection: 'row' }}>
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: RADIUS.sm,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
            }}
          >
            <Text variant="metric">{entry.code}</Text>
          </View>

          <View style={{ flex: 1, rowGap: SPACING.xs }}>
            <Badge
              tone={SEVERITY_TONE[entry.severity]}
              tx={`errorsGuide.severities.${entry.severity}`}
              size="sm"
              withDot
            />
            <Text variant="caption" color="textMuted">
              {t(`errorsGuide.systems.${entry.system}`)}
            </Text>
          </View>
        </View>

        <Text variant="h1">{entry.title}</Text>
        <Text variant="body" color="textSecondary">
          {entry.description}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: driveBg,
          borderRadius: RADIUS.md,
          columnGap: SPACING.md,
          flexDirection: 'row',
          padding: SPACING.lg,
        }}
      >
        <Feather name={entry.safeToDrive ? 'info' : 'alert-octagon'} size={20} color={driveTone} />

        <View style={{ flex: 1, rowGap: SPACING.xs }}>
          <Text
            variant="label"
            rawColor={driveTone}
            tx={entry.safeToDrive ? 'errorsGuide.safeToDrive' : 'errorsGuide.notSafeToDrive'}
          />
          <Text
            variant="bodySm"
            color="textSecondary"
            tx={
              entry.safeToDrive ? 'errorsGuide.safeToDriveBody' : 'errorsGuide.notSafeToDriveBody'
            }
          />
        </View>
      </View>

      <Divider />

      <View style={{ rowGap: SPACING.md }}>
        <Text variant="h2" tx="errorsGuide.commonCauses" />
        <BulletList items={entry.commonCauses} color={colors.textMuted} />
      </View>

      <Divider />

      <View style={{ rowGap: SPACING.md }}>
        <Text variant="h2" tx="errorsGuide.suggestedActions" />
        <BulletList items={entry.suggestedActions} color={colors.primary} />
      </View>

      <Divider />

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text variant="label" color="textSecondary" tx="errorsGuide.estimatedCost" />
        <Badge
          tone={
            entry.estimatedCostBand === 'low'
              ? 'success'
              : entry.estimatedCostBand === 'medium'
                ? 'warning'
                : 'danger'
          }
          tx={`errorsGuide.costBands.${entry.estimatedCostBand}`}
          size="sm"
        />
      </View>

      <Text variant="caption" color="textMuted" tx="errorsGuide.disclaimer" />
    </Sheet>
  );
}
