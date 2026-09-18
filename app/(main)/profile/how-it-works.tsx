import React from 'react';
import { router } from 'expo-router';

import { Screen } from '@/shared/components/layout';
import { HowItWorksCarousel, useTour } from '@/features/onboarding';

/**
 * The walkthrough, reachable any time from Profile.
 *
 * A carousel rather than the spotlight tour: opened from Settings there is no
 * live screen to point at, so this explains the model in prose. The final
 * slide still offers to replay the in-app tour for anyone who wants the
 * contextual version.
 */
export default function HowItWorks() {
  const { requestTour } = useTour();

  return (
    <Screen gap="lg" header={{ titleTx: 'howItWorks.title' }}>
      <HowItWorksCarousel
        onFinish={() => router.back()}
        finishTx="howItWorks.finish"
        secondaryActionTx="howItWorks.replayTour"
        onSecondaryAction={() => {
          // The tour's targets only exist on Home, so queue it and navigate.
          requestTour('home');
          router.replace('/(main)/(tabs)/Home');
        }}
      />
    </Screen>
  );
}
