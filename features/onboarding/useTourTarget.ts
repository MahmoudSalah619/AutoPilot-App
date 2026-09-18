import { useCallback, useEffect, useRef } from 'react';
import type { View } from 'react-native';

import { useTour } from './useTour';
import type { TargetRect } from './types';

/**
 * Marks a view as a spotlight target.
 *
 * Attach the returned ref to a wrapping `View`. On Android the wrapper also
 * needs `collapsable={false}`, otherwise the view is optimised out of the
 * native hierarchy and cannot be measured — `tourTargetProps` bundles both.
 *
 * @example
 * const odometer = useTourTarget(TOUR_TARGETS.odometer);
 * <View {...odometer}>...</View>
 */
export function useTourTarget(id: string) {
  const { registerTarget } = useTour();
  const ref = useRef<View>(null);

  const measure = useCallback(
    () =>
      new Promise<TargetRect | null>((resolve) => {
        const node = ref.current;

        if (!node?.measureInWindow) {
          resolve(null);
          return;
        }

        // measureInWindow never rejects; guard against it never firing either.
        const timeout = setTimeout(() => resolve(null), 500);

        node.measureInWindow((x, y, width, height) => {
          clearTimeout(timeout);
          resolve({ x, y, width, height });
        });
      }),
    []
  );

  useEffect(() => registerTarget(id, measure), [id, measure, registerTarget]);

  return { ref, collapsable: false } as const;
}

export default useTourTarget;
