import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { clearFirstRunPending, isFirstRunPending } from './firstRun';
import { TOURS } from './tours';
import TourOverlay from './TourOverlay';
import type { TargetMeasurer, TargetRect, TourContextValue, TourId } from './types';

const STORAGE_KEY = 'autopilot.seen-tours';

export const TourContext = createContext<TourContextValue | null>(null);

/**
 * Owns the guided-tour state.
 *
 * Targets register a *measuring function* rather than a rectangle, so each
 * step reads the element's real position at the moment it becomes active. That
 * keeps the spotlight correct after a re-render, an orientation change or a
 * layout shift, which a cached rect would not.
 */
export function TourProvider({ children }: { children: React.ReactNode }) {
  const measurers = useRef(new Map<string, TargetMeasurer>());
  const requestedTour = useRef<TourId | null>(null);

  const [seenTours, setSeenTours] = useState<TourId[]>([]);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeTour, setActiveTour] = useState<TourId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), isFirstRunPending()])
      .then(([storedTours, firstRun]) => {
        setIsFirstRun(firstRun);

        if (!storedTours) return;

        const parsed = JSON.parse(storedTours);
        if (Array.isArray(parsed)) setSeenTours(parsed as TourId[]);
      })
      .catch(() => {
        // A missing or corrupt flag just means the tour is skipped.
      })
      .finally(() => setIsReady(true));
  }, []);

  const steps = activeTour ? TOURS[activeTour] : [];
  const currentStep = steps[stepIndex];

  /**
   * Re-measures whenever the active step changes.
   *
   * A target may not be laid out on the very first frame, so a miss is retried
   * a couple of times before the step is skipped — better than showing a
   * spotlight over the wrong part of the screen.
   */
  useEffect(() => {
    if (!currentStep) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let attempt = 0;

    const measure = async () => {
      const measurer = measurers.current.get(currentStep.targetId);
      const measured = measurer ? await measurer() : null;

      if (cancelled) return;

      if (measured && measured.width > 0 && measured.height > 0) {
        setRect(measured);
        return;
      }

      attempt += 1;
      if (attempt < 4) {
        setTimeout(measure, 120);
      } else {
        // The target is genuinely absent on this screen; move past it.
        setRect(null);
      }
    };

    measure();

    return () => {
      cancelled = true;
    };
  }, [currentStep]);

  const persistSeen = useCallback((id: TourId) => {
    setSeenTours((current) => {
      if (current.includes(id)) return current;

      const next = [...current, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const registerTarget = useCallback((id: string, measure: TargetMeasurer) => {
    measurers.current.set(id, measure);

    return () => {
      measurers.current.delete(id);
    };
  }, []);

  const startTour = useCallback((id: TourId) => {
    setStepIndex(0);
    setActiveTour(id);
  }, []);

  /**
   * Auto-starts a tour for genuine first-time users only.
   *
   * Requires both the first-run flag (set at sign-up) and that the tour has
   * never been completed on this device. Anyone signing into an existing
   * account is left alone.
   */
  const startFirstRunTour = useCallback(
    (id: TourId) => {
      if (!isReady || !isFirstRun || seenTours.includes(id)) return;
      startTour(id);
    },
    [isReady, isFirstRun, seenTours, startTour]
  );

  const requestTour = useCallback((id: TourId) => {
    requestedTour.current = id;
  }, []);

  const consumeRequestedTour = useCallback(
    (id: TourId) => {
      if (requestedTour.current !== id) return false;

      requestedTour.current = null;
      startTour(id);
      return true;
    },
    [startTour]
  );

  const end = useCallback(() => {
    if (activeTour) persistSeen(activeTour);

    // First run is over once the tour has been seen through or skipped.
    setIsFirstRun(false);
    clearFirstRunPending();

    setActiveTour(null);
    setStepIndex(0);
    setRect(null);
  }, [activeTour, persistSeen]);

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      end();
      return;
    }

    setStepIndex((current) => current + 1);
  }, [stepIndex, steps.length, end]);

  const back = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  const value = useMemo<TourContextValue>(
    () => ({
      activeTour,
      stepIndex,
      isReady,
      registerTarget,
      startTour,
      requestTour,
      consumeRequestedTour,
      startFirstRunTour,
      next,
      back,
      end,
    }),
    [
      activeTour,
      stepIndex,
      isReady,
      registerTarget,
      startTour,
      requestTour,
      consumeRequestedTour,
      startFirstRunTour,
      next,
      back,
      end,
    ]
  );

  return (
    <TourContext.Provider value={value}>
      {/* The overlay is a sibling of the app content, not a Modal, so it
          shares the window that target rectangles are measured against. */}
      <View style={{ flex: 1 }}>
        {children}

        <TourOverlay
          isVisible={Boolean(activeTour && currentStep)}
          step={currentStep}
          rect={rect}
          stepIndex={stepIndex}
          stepCount={steps.length}
          onNext={next}
          onBack={back}
          onSkip={end}
        />
      </View>
    </TourContext.Provider>
  );
}
