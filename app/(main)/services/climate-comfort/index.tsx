import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useTheme } from '@/theme';
import { useDeleteClimateRecordMutation, useGetClimateRecordsQuery } from '@/apis/autopilotApi';
import { buildClimateStatuses } from '@/apis/repositories/climate';
import { useActiveVehicle } from '@/hooks/useActiveVehicle';
import type { ClimateRecord, ClimateServiceType } from '@/@types/models';
import { ConfirmDialog, Screen } from '@/shared/components/layout';
import {
  Card,
  Divider,
  EmptyState,
  Fab,
  IconButton,
  SectionHeader,
  SkeletonCard,
  Text,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/Toast';
import { ClimateLogSheet, ClimateStatusCard } from '@/features/services/climate';
import { formatCurrency, formatDate } from '@/utils/format';

const TIPS = ['runAc', 'recirculate', 'filter', 'smell'] as const;

export default function ClimateComfort() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { vehicle, hasVehicle } = useActiveVehicle();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [initialType, setInitialType] = useState<ClimateServiceType | undefined>();
  const [pendingDelete, setPendingDelete] = useState<ClimateRecord | undefined>();

  const {
    data: records = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetClimateRecordsQuery(vehicle?.id, { skip: !vehicle });

  const [deleteRecord, { isLoading: isDeleting }] = useDeleteClimateRecordMutation();

  const statuses = useMemo(() => buildClimateStatuses(records), [records]);

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      await deleteRecord(pendingDelete.id).unwrap();
      toast.success(t('climate.deleteTitle'));
    } catch (error) {
      const message = (error as { message?: string })?.message ?? 'errors.deleteFailed';
      toast.error(t('errors.deleteFailed'), t(message, { defaultValue: message }));
    } finally {
      setPendingDelete(undefined);
    }
  };

  const openLog = (type?: ClimateServiceType) => {
    setInitialType(type);
    setIsSheetOpen(true);
  };

  const header = {
    titleTx: 'climate.title',
    subtitleTx: 'climate.subtitle',
    variant: 'large' as const,
  };

  if (!hasVehicle) {
    return (
      <Screen header={header}>
        <EmptyState icon="truck" titleTx="vehicle.emptyTitle" bodyTx="vehicle.emptyBody" />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      gap="xxl"
      header={header}
      refreshing={isFetching}
      onRefresh={refetch}
      overlay={
        <Fab
          aboveTabBar={false}
          onPress={() => openLog()}
          labelTx="climate.logTitle"
          accessibilityLabel={t('climate.logTitle')}
        />
      }
      contentStyle={{ paddingBottom: 120 }}
    >
      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader
          titleTx="climate.healthTitle"
          subtitleTx="climate.healthSubtitle"
          icon="activity"
        />

        {isLoading ? (
          <SkeletonCard count={3} />
        ) : (
          statuses.map((status) => (
            <ClimateStatusCard
              key={status.type}
              status={status}
              onLog={() => openLog(status.type)}
            />
          ))
        )}
      </View>

      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader titleTx="climate.historyTitle" icon="clock" />

        {records.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              layout="inline"
              icon="wind"
              titleTx="climate.emptyTitle"
              bodyTx="climate.emptyBody"
              actionTx="climate.logTitle"
              onAction={() => openLog()}
            />
          </Card>
        ) : (
          <Card padding="md">
            {records.map((record, index) => (
              <View key={record.id}>
                {index > 0 && <Divider />}

                <View
                  style={{
                    alignItems: 'center',
                    columnGap: SPACING.md,
                    flexDirection: 'row',
                    paddingVertical: SPACING.md,
                  }}
                >
                  <View style={{ flex: 1, rowGap: 2 }}>
                    <Text variant="h3" tx={`climate.types.${record.type}`} />
                    <Text variant="caption" color="textMuted">
                      {[
                        formatDate(record.date),
                        record.cost != null ? formatCurrency(record.cost, record.currency) : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>

                  <IconButton
                    icon="trash-2"
                    size="sm"
                    color="danger"
                    onPress={() => setPendingDelete(record)}
                    accessibilityLabel={t('common.delete')}
                  />
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>

      <View style={{ rowGap: SPACING.md }}>
        <SectionHeader titleTx="climate.tipsTitle" icon="info" />

        <Card variant="flat" style={{ rowGap: SPACING.lg }}>
          {TIPS.map((tip, index) => (
            <View key={tip} style={{ columnGap: SPACING.md, flexDirection: 'row' }}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderRadius: RADIUS.pill,
                  height: 24,
                  justifyContent: 'center',
                  width: 24,
                }}
              >
                <Text variant="labelSm" color="accentTeal">
                  {String(index + 1)}
                </Text>
              </View>

              <Text
                variant="bodySm"
                color="textSecondary"
                tx={`climate.tips.${tip}`}
                style={{ flex: 1 }}
              />
            </View>
          ))}
        </Card>
      </View>

      {!!vehicle && (
        <ClimateLogSheet
          isVisible={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          vehicleId={vehicle.id}
          currentOdometer={vehicle.odometer}
          initialType={initialType}
        />
      )}

      <ConfirmDialog
        isVisible={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(undefined)}
        onConfirm={handleDelete}
        titleTx="climate.deleteTitle"
        bodyTx="climate.deleteBody"
        confirmTx="common.delete"
        tone="danger"
        icon="trash-2"
        loading={isDeleting}
      />
    </Screen>
  );
}
