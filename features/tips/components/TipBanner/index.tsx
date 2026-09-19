import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { RADIUS, SPACING } from '@/constants/Layout';
import { useGetTipsQuery } from '@/apis/autopilotApi';
import type { Tip, TipScreen } from '@/apis/repositories/reference';
import { useTheme } from '@/theme';
import { IconButton, Text } from '@/shared/components/ui';
import { dismissTip, getDismissedTips } from '../../dismissed';

export interface TipBannerProps {
  /** Which screen's tips to show. Matches the `tips.screen` enum. */
  screen: TipScreen;
}

/**
 * Contextual tip or alert for a screen, from the `tips` table.
 *
 * Shows one at a time — a stack of advice on top of a screen is noise, and
 * the newest tip is the one worth reading. Renders nothing when there is no
 * undismissed tip, so a screen with no content in the table looks exactly as
 * it did before.
 */
export default function TipBanner({ screen }: TipBannerProps) {
  const { colors } = useTheme();
  const { data: tips = [] } = useGetTipsQuery(screen);

  const [dismissed, setDismissed] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDismissedTips().then((ids) => {
      if (!cancelled) setDismissed(ids);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDismiss = useCallback(async (id: string) => {
    setDismissed((current) => [...(current ?? []), id]);
    await dismissTip(id);
  }, []);

  // Unknown until storage answers; rendering early would flash a tip the
  // user already dismissed.
  if (dismissed === null) return null;

  const tip: Tip | undefined = tips.find((candidate) => !dismissed.includes(candidate.id));
  if (!tip) return null;

  const isAlert = tip.type === 'alert';

  return (
    <View
      accessibilityRole="summary"
      style={{
        backgroundColor: colors[isAlert ? 'warningSoft' : 'infoSoft'],
        borderColor: colors[isAlert ? 'warningBorder' : 'infoBorder'],
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        columnGap: SPACING.md,
        flexDirection: 'row',
        padding: SPACING.md,
      }}
    >
      <Feather
        name={isAlert ? 'alert-triangle' : 'info'}
        size={18}
        color={colors[isAlert ? 'warning' : 'info']}
        style={{ marginTop: 2 }}
      />

      <View style={{ flex: 1, rowGap: SPACING.xxs }}>
        <Text variant="label">{tip.title}</Text>
        {!!tip.description && (
          <Text variant="bodySm" color="textSecondary">
            {tip.description}
          </Text>
        )}
      </View>

      <IconButton
        icon="x"
        size="sm"
        variant="plain"
        color="textSecondary"
        onPress={() => handleDismiss(tip.id)}
        accessibilityLabelTx="common.close"
      />
    </View>
  );
}
