import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import type { ColorToken } from '@/constants/Colors';
import type { ServiceReminder, Vehicle } from '@/@types/models';
import {
  AnimatedNumber,
  Badge,
  Button,
  Card,
  ProgressBar,
  PulseHalo,
  Text,
} from '@/shared/components/ui';
import { nextDistanceMilestone, resolveOdometerFreshness } from '@/utils/domain';
import { formatNumber, formatRelative } from '@/utils/format';
import { TOUR_TARGETS, useTourTarget } from '@/features/onboarding';

export interface VehicleSummaryCardProps {
  vehicle: Vehicle;
  /**
   * Active reminders, used to show what the current reading is counting down
   * to. Omit and the milestone line is hidden.
   */
  reminders?: ServiceReminder[];
  /** Opens the odometer sheet. */
  onUpdateOdometer?: () => void;
  /** Opens the vehicle switcher; omitted when the user has only one car. */
  onSwitchVehicle?: () => void;
  onPress?: () => void;
}

/** Caption colour and label per freshness level. */
const FRESHNESS_META: Record<
  ReturnType<typeof resolveOdometerFreshness>,
  { tone: ColorToken; labelTx?: string; badgeTone?: 'warning' | 'danger' }
> = {
  fresh: { tone: 'textMuted' },
  aging: { tone: 'textSecondary' },
  stale: { tone: 'warning', labelTx: 'vehicle.odometerStale', badgeTone: 'warning' },
  never: { tone: 'warning', labelTx: 'vehicle.odometerNever', badgeTone: 'warning' },
};

/**
 * Hero card on the home screen.
 *
 * The odometer is the headline rather than one detail among several, because
 * it is the input the rest of the app is derived from. When the reading goes
 * stale the card changes state and the update control gains a halo — so the
 * motion only appears when there is genuinely something to do.
 */
export default function VehicleSummaryCard({
  vehicle,
  reminders = [],
  onUpdateOdometer,
  onSwitchVehicle,
  onPress,
}: VehicleSummaryCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const odometerTarget = useTourTarget(TOUR_TARGETS.odometer);
  const updateTarget = useTourTarget(TOUR_TARGETS.updateOdometer);

  const displayName = vehicle.nickname || `${vehicle.make} ${vehicle.model}`;
  const subtitle = vehicle.nickname
    ? `${vehicle.make} ${vehicle.model} · ${vehicle.year}`
    : String(vehicle.year);

  const freshness = resolveOdometerFreshness(vehicle.odometerUpdatedAt);
  const meta = FRESHNESS_META[freshness];
  const needsAttention = freshness === 'stale' || freshness === 'never';

  const milestone = nextDistanceMilestone(reminders, vehicle.odometer);

  return (
    <Card
      padding="xl"
      style={{
        borderColor: needsAttention ? colors.warningBorder : colors.border,
        rowGap: SPACING.xl,
      }}
    >
      {/* Vehicle identity */}
      <View style={{ alignItems: 'flex-start', columnGap: SPACING.md, flexDirection: 'row' }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.primarySoft,
            borderRadius: RADIUS.md,
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}
        >
          <Feather name="truck" size={20} color={colors.primary} />
        </View>

        <View style={{ flex: 1, rowGap: SPACING.xxs }}>
          <Text variant="h2" numberOfLines={1}>
            {displayName}
          </Text>
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {onSwitchVehicle ? (
          <Button
            variant="ghost"
            size="sm"
            tx="vehicle.vehicles"
            rightIcon={<Feather name="chevron-down" size={14} color={colors.primary} />}
            onPress={onSwitchVehicle}
          />
        ) : (
          vehicle.isPrimary && <Badge tone="primary" tx="vehicle.primary" size="sm" />
        )}
      </View>

      {/* Odometer — the headline number */}
      <View
        {...odometerTarget}
        style={{
          backgroundColor: needsAttention ? colors.warningSoft : colors.surfaceAlt,
          borderRadius: RADIUS.lg,
          padding: SPACING.lg,
          rowGap: SPACING.sm,
        }}
      >
        <View
          style={{
            alignItems: 'center',
            columnGap: SPACING.sm,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text variant="overline" color="textMuted" tx="vehicle.odometer" />

          {!!meta.badgeTone && !!meta.labelTx && (
            <Badge tone={meta.badgeTone} tx={meta.labelTx} size="sm" withDot />
          )}
        </View>

        <View style={{ alignItems: 'baseline', columnGap: SPACING.xs, flexDirection: 'row' }}>
          <AnimatedNumber
            variant="displayLg"
            value={vehicle.odometer}
            format={(next) => formatNumber(next)}
          />
          <Text variant="h3" color="textSecondary" tx="units.km" />
        </View>

        <Text variant="caption" color={meta.tone}>
          {vehicle.odometerUpdatedAt
            ? t('vehicle.odometerUpdated', { when: formatRelative(vehicle.odometerUpdatedAt) })
            : t('vehicle.odometerNeverBody')}
        </Text>
      </View>

      {/* What the reading is counting down to — the reason to keep it current */}
      {!!milestone && (
        <ProgressBar
          value={milestone.progress}
          tone={milestone.isOverdue ? 'danger' : milestone.progress > 0.85 ? 'warning' : 'primary'}
          label={milestone.title}
          valueLabel={
            milestone.isOverdue
              ? t('due.overdueByKm', { count: Math.abs(Math.round(milestone.remainingKm)) })
              : t('due.inKm', { count: Math.round(milestone.remainingKm) })
          }
        />
      )}

      <View style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
        {!!onUpdateOdometer && (
          <PulseHalo active={needsAttention} tone="warning" radius="md" style={{ flex: 1 }}>
            <View {...updateTarget}>
              <Button
                variant={needsAttention ? 'primary' : 'secondary'}
                tx="home.updateOdometer"
                fullWidth
                leftIcon={
                  <Feather
                    name="edit-3"
                    size={16}
                    color={needsAttention ? colors.onPrimary : colors.primary}
                  />
                }
                onPress={onUpdateOdometer}
              />
            </View>
          </PulseHalo>
        )}

        {!!onPress && (
          <Button
            variant="outline"
            iconOnly
            leftIcon={<Feather name="settings" size={18} color={colors.text} />}
            onPress={onPress}
            accessibilityLabel={t('vehicle.editTitle')}
          />
        )}
      </View>

      {/* Reinforces why the number matters, only while it is stale. */}
      {needsAttention && (
        <View
          style={{
            alignItems: 'flex-start',
            columnGap: SPACING.sm,
            flexDirection: 'row',
          }}
        >
          <Feather name="info" size={14} color={colors.textMuted} />
          <Text variant="caption" color="textMuted" tx="vehicle.odometerWhy" style={{ flex: 1 }} />
        </View>
      )}
    </Card>
  );
}
