import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'autopilot.dismissed-tips';

/**
 * Tips this device has already dismissed.
 *
 * `tips.is_seen` looks like the right place for this, but the column is
 * global — one row shared by every user — and the table's only policy is
 * `select`, so a client cannot write it at all. Dismissal is therefore local
 * to the device. If tips ever need to be per-account, that wants a
 * `tip_dismissals (user_id, tip_id)` table rather than a flag on the tip.
 */
export async function getDismissedTips(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    // A corrupt or unreadable list means showing a tip again, which is a
    // far smaller problem than throwing inside a render.
    return [];
  }
}

export async function dismissTip(id: string): Promise<void> {
  try {
    const current = await getDismissedTips();
    if (current.includes(id)) return;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]));
  } catch {
    // Non-fatal: the tip reappears next launch.
  }
}
