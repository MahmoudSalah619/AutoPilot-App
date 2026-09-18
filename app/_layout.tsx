import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import '@/locale';
import store from '@/redux';
import { ThemeProvider, useTheme } from '@/theme';
import { useAppUpdates } from '@/hooks/useAppUpdates';
import { useLoadResources } from '@/hooks/useLoadResources';
import { ConfirmDialog } from '@/shared/components/layout';
import { toastConfig } from '@/shared/components/ui/Toast';

/**
 * Renders the navigator once the theme exists above it, so the status bar and
 * screen backgrounds can follow the active scheme.
 */
function ThemedRoot() {
  const { isDark, colors } = useTheme();
  const { updateKind, isUpdateAvailable, isDismissible, dismiss, applyUpdate } = useAppUpdates();

  const isStoreUpdate = updateKind === 'store';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="+not-found" />
      </Stack>

      <ConfirmDialog
        isVisible={isUpdateAvailable}
        onClose={isDismissible ? dismiss : () => {}}
        onConfirm={applyUpdate}
        titleTx={isStoreUpdate ? 'app.updateRequiredTitle' : 'app.updateAvailableTitle'}
        bodyTx={isStoreUpdate ? 'app.updateRequiredBody' : 'app.updateAvailableBody'}
        confirmTx={isStoreUpdate ? 'app.updateGoToStore' : 'app.updateRestart'}
        cancelTx="app.updateLater"
        icon={isStoreUpdate ? 'download' : 'refresh-cw'}
      />

      <Toast config={toastConfig} topOffset={60} />
    </>
  );
}

/**
 * Root layout.
 *
 * Provider order matters: `SafeAreaProvider` has to wrap `ThemeProvider`
 * because themed screens read insets, and both sit inside
 * `GestureHandlerRootView` so sheets and swipes work on Android.
 */
export default function RootLayout() {
  const { areResourcesLoaded } = useLoadResources();

  if (!areResourcesLoaded) {
    // The native splash screen stays up until fonts resolve.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider>
            <ThemedRoot />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
