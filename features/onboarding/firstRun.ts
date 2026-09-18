import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'autopilot.first-run-pending';

/**
 * Marks this device as being in its first run, so the guided tour may show.
 *
 * Called only from sign-up. Signing *in* deliberately does not set it: someone
 * restoring an existing account on a new phone is not a first-time user and
 * should not be walked through an app they already know. They can still replay
 * the walkthrough from Settings.
 */
export async function markFirstRunPending(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // Failing to set the flag just means the tour is skipped. Not worth
    // blocking sign-up over.
  }
}

export async function isFirstRunPending(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function clearFirstRunPending(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // The `seenTours` flag is the authoritative "already shown" marker, so a
    // lingering first-run flag cannot cause a replay on its own.
  }
}
