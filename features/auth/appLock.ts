import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'autopilot.app-lock-enabled';

/**
 * Whether biometrics guard re-entry to a signed-in session on this device.
 *
 * Device-scoped rather than account-scoped, which is why it lives in
 * AsyncStorage and not in the user's preferences: "unlock with Face ID" is a
 * statement about this phone, and syncing it to a shared tablet or a second
 * device the user has not enrolled on would be wrong.
 *
 * It is a convenience lock over an existing session, not an authentication
 * factor — the session is already valid, the biometric only decides whether
 * to show it. Nothing here should be mistaken for a way *into* an account.
 */
export async function isAppLockEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
  } catch {
    // A storage failure must not lock someone out of their own app.
    return false;
  }
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Reported to the caller by re-reading, so the toggle can snap back
    // rather than claim a setting that did not stick.
  }
}
