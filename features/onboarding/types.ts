/** Identifies a tour. One per screen that has something worth explaining. */
export type TourId = 'home';

/** Window-space rectangle of a spotlight target. */
export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Measures a registered target on demand, so layouts are never stale. */
export type TargetMeasurer = () => Promise<TargetRect | null>;

export interface TourStep {
  /** Matches the id passed to `useTourTarget`. */
  targetId: string;
  titleTx: string;
  bodyTx: string;
  /** Extra breathing room around the cutout, in points. */
  padding?: number;
  /** Corner radius of the cutout. Match the target's own radius. */
  radius?: number;
  /**
   * Forces the tooltip to one side. `auto` picks whichever side has room,
   * which is what you want for targets near a screen edge.
   */
  placement?: 'auto' | 'above' | 'below';
}

export interface TourContextValue {
  activeTour: TourId | null;
  stepIndex: number;
  /** True once the persisted "seen" flags have been read from disk. */
  isReady: boolean;
  registerTarget: (id: string, measure: TargetMeasurer) => () => void;
  /** Starts a tour immediately. */
  startTour: (id: TourId) => void;
  /**
   * Starts a tour the next time its screen mounts. Used from Settings, where
   * the tour's targets do not exist yet.
   */
  requestTour: (id: TourId) => void;
  /** Called by a screen on mount to pick up a queued request. */
  consumeRequestedTour: (id: TourId) => boolean;
  /**
   * Starts a tour only for a genuine first-time user: the account was created
   * on this device and the tour has never been completed here.
   */
  startFirstRunTour: (id: TourId) => void;
  next: () => void;
  back: () => void;
  /** Ends the tour and records it as seen. */
  end: () => void;
}
