import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import type { Vehicle } from '@/@types/models';
import { resolveOdometerFreshness, type OdometerFreshness } from '@/utils/domain';

const STORAGE_PREFIX = 'autopilot.odometer-prompted';

/** Grace period after mount, so the prompt never races the screen settling. */
const PROMPT_DELAY_MS = 900;

function storageKey(vehicleId: string) {
  return `${STORAGE_PREFIX}:${vehicleId}`;
}

export interface UseOdometerNudgeOptions {
  vehicle?: Vehicle;
  /**
   * Blocks the prompt while something else owns the screen — the guided tour,
   * most importantly. Two overlays at once is the fastest way to make an app
   * feel hostile.
   *
   * Suppression is sticky for the lifetime of the hook: once something has
   * claimed the screen, the prompt waits for the next visit rather than
   * springing up the moment the tour closes.
   */
  isSuppressed?: boolean;
}

export interface OdometerNudge {
  freshness: OdometerFreshness;
  /** True when the reading is old enough to warrant highlighting in the UI. */
  needsAttention: boolean;
  /** True when the sheet should open on its own, at most once per day. */
  shouldPrompt: boolean;
  /** Records that the prompt was shown today and closes it. */
  dismissPrompt: () => void;
}

/**
 * Decides when to ask for a fresh odometer reading.
 *
 * Deliberately *not* on every launch. A prompt that fires when the number is
 * already current teaches people to dismiss it without reading, which is worse
 * than no prompt at all — so this only speaks up once the stored reading has
 * actually gone stale, and then only once a day.
 */
export function useOdometerNudge({
  vehicle,
  isSuppressed = false,
}: UseOdometerNudgeOptions): OdometerNudge {
  const [wasPromptedToday, setWasPromptedToday] = useState<boolean | null>(null);
  const [hasDelayElapsed, setHasDelayElapsed] = useState(false);
  const wasEverSuppressed = useRef(false);

  if (isSuppressed) wasEverSuppressed.current = true;

  const freshness = resolveOdometerFreshness(vehicle?.odometerUpdatedAt);
  const needsAttention = freshness === 'stale' || freshness === 'never';

  useEffect(() => {
    if (!vehicle?.id) return;

    let cancelled = false;
    setWasPromptedToday(null);

    AsyncStorage.getItem(storageKey(vehicle.id))
      .then((stored) => {
        if (cancelled) return;
        setWasPromptedToday(stored === dayjs().format('YYYY-MM-DD'));
      })
      .catch(() => {
        // Unreadable flag: treat as not yet prompted rather than going silent.
        if (!cancelled) setWasPromptedToday(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vehicle?.id]);

  useEffect(() => {
    const timer = setTimeout(() => setHasDelayElapsed(true), PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismissPrompt = useCallback(() => {
    setWasPromptedToday(true);

    if (vehicle?.id) {
      AsyncStorage.setItem(storageKey(vehicle.id), dayjs().format('YYYY-MM-DD')).catch(() => {});
    }
  }, [vehicle?.id]);

  const shouldPrompt =
    !isSuppressed &&
    !wasEverSuppressed.current &&
    hasDelayElapsed &&
    needsAttention &&
    wasPromptedToday === false &&
    Boolean(vehicle);

  return { freshness, needsAttention, shouldPrompt, dismissPrompt };
}

export default useOdometerNudge;
