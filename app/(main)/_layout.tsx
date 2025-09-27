import MainScreenOptions from '@/components/organisms/scoped/navigation/MainScreenOptions';
import { Stack } from 'expo-router';

export default function _layout() {
  return (
    <Stack screenOptions={MainScreenOptions}>
      <Stack.Screen name="(tabs)" initialParams={{ hasLogo: true }} />
      <Stack.Screen
        name="maintenance-details"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="services"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
