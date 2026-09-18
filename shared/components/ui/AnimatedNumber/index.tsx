import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import Text from '@/shared/components/ui/Text';
import type { TextProps } from '@/shared/components/ui/Text/types';

export interface AnimatedNumberProps extends Omit<TextProps, 'children' | 'tx'> {
  value: number;
  /** Renders the tweened value. Receives a rounded number. */
  format?: (value: number) => string;
  durationMs?: number;
}

/** Ease-out cubic: fast at first, settling into the final value. */
function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * A number that counts up when it changes.
 *
 * Deliberately does **not** animate on mount — only on a genuine change. A
 * counter that runs every time the screen appears reads as decoration and
 * people stop seeing it; one that only moves when the value actually moved
 * tells you something happened.
 *
 * Renders a real `Text` node (rather than the animated-TextInput trick) so it
 * keeps RTL handling, the type scale and screen-reader output intact.
 */
export default function AnimatedNumber({
  value,
  format = (next) => String(next),
  durationMs = 900,
  ...textProps
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = previousValue.current;
    const to = value;
    previousValue.current = value;

    if (from === to) return;

    let cancelled = false;

    const run = (shouldAnimate: boolean) => {
      if (cancelled) return;

      if (!shouldAnimate) {
        setDisplayValue(to);
        return;
      }

      const startedAt = Date.now();

      const tick = () => {
        if (cancelled) return;

        const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
        setDisplayValue(from + (to - from) * easeOut(progress));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayValue(to);
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    // Honour the OS reduce-motion setting: jump straight to the value.
    AccessibilityInfo.isReduceMotionEnabled()
      .then((isReduced) => run(!isReduced))
      .catch(() => run(true));

    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  return (
    <Text {...textProps} accessibilityLabel={format(Math.round(value))}>
      {format(Math.round(displayValue))}
    </Text>
  );
}
