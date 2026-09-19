/**
 * Contextual tips and alerts, driven by the `tips` table.
 *
 * Content is authored in Supabase rather than in the app, so a tip can be
 * added or corrected without a release. Each row targets one screen via the
 * `screen` enum; dismissal is per device — see `dismissed.ts` for why.
 */

export * from './components';
export * from './dismissed';
