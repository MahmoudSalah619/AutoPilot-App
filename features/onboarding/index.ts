export { TourProvider, TourContext } from './TourProvider';
export { default as TourOverlay } from './TourOverlay';
export { useTour } from './useTour';
export { useTourTarget } from './useTourTarget';
export { TOURS, TOUR_TARGETS } from './tours';
export { markFirstRunPending, isFirstRunPending, clearFirstRunPending } from './firstRun';
export {
  default as HowItWorksCarousel,
  HOW_IT_WORKS_SLIDES,
} from './components/HowItWorksCarousel';
export type { HowItWorksCarouselProps, HowItWorksSlide } from './components/HowItWorksCarousel';

export type { TourContextValue, TourId, TourStep, TargetRect } from './types';
export type { TourOverlayProps } from './TourOverlay';
