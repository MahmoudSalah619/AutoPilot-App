/**
 * Auth feature.
 *
 * There is no component here any more: the biometric "sign in" shortcut that
 * used to live in this folder routed into the app on a successful
 * fingerprint without checking for a session, so any device with an enrolled
 * finger could reach the authenticated shell with no account behind it.
 * Biometrics are now a lock over an existing session — see
 * `app/(auth)/unlock` and `appLock.ts`.
 */

export * from './validation';
export * from './appLock';
