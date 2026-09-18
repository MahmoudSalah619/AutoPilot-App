import React from 'react';
import { router } from 'expo-router';

import { Screen } from '@/shared/components/layout';
import { EmptyState } from '@/shared/components/ui';

export default function NotFoundScreen() {
  return (
    <Screen>
      <EmptyState
        icon="compass"
        titleTx="errors.notFoundTitle"
        bodyTx="errors.notFoundBody"
        actionTx="errors.backHome"
        onAction={() => router.replace('/(main)/(tabs)/Home')}
      />
    </Screen>
  );
}
