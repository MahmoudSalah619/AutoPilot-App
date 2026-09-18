import { useContext } from 'react';

import { TourContext } from './TourProvider';
import type { TourContextValue } from './types';

/** Access to the tour controller. Must be called under `<TourProvider>`. */
export function useTour(): TourContextValue {
  const context = useContext(TourContext);

  if (!context) {
    throw new Error('useTour must be used within a <TourProvider>.');
  }

  return context;
}

export default useTour;
