import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import useInitialRouting from '../hooks/useInitialRouting';
import { Redirect, RelativePathString } from 'expo-router';
import * as Sentry from '@sentry/react-native';

const InitialScreen = () => {
  const { targetPath } = useInitialRouting();

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || 'YOUR_DSN_HERE',
    enableNative: true,
    enableNativeNagger: false,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    integrations: [new Sentry.ReactNativeTracing()],
    tracesSampleRate: 1.0,
  });

  if (!targetPath) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Redirect href={targetPath as RelativePathString} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InitialScreen;
