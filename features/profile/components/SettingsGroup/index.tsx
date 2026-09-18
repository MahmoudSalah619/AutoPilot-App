import React from 'react';
import { View } from 'react-native';

import { SPACING } from '@/constants/Layout';
import { Card, Divider, SectionHeader } from '@/shared/components/ui';

export interface SettingsGroupProps {
  titleTx?: string;
  children: React.ReactNode;
  /** Leading inset for the dividers, aligning them under the row text. */
  dividerInset?: number;
}

/**
 * A titled card of `ListRow`s with dividers between them.
 *
 * Every settings screen composes from this, which is what keeps Profile,
 * Notifications, Privacy and Help visually identical.
 */
export default function SettingsGroup({
  titleTx,
  children,
  dividerInset = 50,
}: SettingsGroupProps) {
  const rows = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={{ rowGap: SPACING.sm }}>
      {!!titleTx && <SectionHeader titleTx={titleTx} />}

      <Card padding="md">
        {rows.map((row, index) => (
          <View key={index}>
            {index > 0 && <Divider inset={dividerInset} />}
            {row}
          </View>
        ))}
      </Card>
    </View>
  );
}
