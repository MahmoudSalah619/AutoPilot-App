import type { TourId, TourStep } from './types';

/** Target ids, shared between the step definitions and `useTourTarget`. */
export const TOUR_TARGETS = {
  odometer: 'home.odometer',
  updateOdometer: 'home.updateOdometer',
  quickActions: 'home.quickActions',
  tabs: 'app.tabs',
} as const;

/**
 * The home tour.
 *
 * Ordered so the odometer comes first — it is the number every other feature
 * is measured against, so it is the one thing a new user has to understand.
 *
 * Every step targets something visible without scrolling, because the tour
 * runs on a freshly mounted screen and does not drive the scroll position.
 */
const HOME_TOUR: TourStep[] = [
  {
    targetId: TOUR_TARGETS.odometer,
    titleTx: 'tour.home.odometerTitle',
    bodyTx: 'tour.home.odometerBody',
    radius: 12,
    placement: 'below',
  },
  {
    targetId: TOUR_TARGETS.updateOdometer,
    titleTx: 'tour.home.updateTitle',
    bodyTx: 'tour.home.updateBody',
    radius: 12,
    placement: 'below',
  },
  {
    targetId: TOUR_TARGETS.quickActions,
    titleTx: 'tour.home.quickActionsTitle',
    bodyTx: 'tour.home.quickActionsBody',
    radius: 16,
    placement: 'below',
  },
  {
    targetId: TOUR_TARGETS.tabs,
    titleTx: 'tour.home.tabsTitle',
    bodyTx: 'tour.home.tabsBody',
    padding: 4,
    radius: 16,
    placement: 'above',
  },
];

export const TOURS: Record<TourId, TourStep[]> = {
  home: HOME_TOUR,
};
