/**
 * App-level constants that point at the outside world.
 *
 * Kept in one file so store links, support routes and legal URLs can be
 * updated without touching any screen.
 */
const IMPORTANT_VARS = {
  appName: 'AutoPilot',
  version: '1.0.0',

  /** Store listings, used by the update prompt and the "rate us" action. */
  androidStoreLink: 'https://play.google.com/store/apps/details?id=com.nova.autopilot',
  iosStoreLink: 'https://apps.apple.com/app/autopilot/id0000000000',

  /** Blocks the app until the user updates. Flip on for breaking releases. */
  forceStoreUpdate: false,

  /** Support routes surfaced on the help screen. */
  supportEmail: 'support@autopilot.app',
  supportWhatsApp: 'https://wa.me/201005541537',
  websiteUrl: 'https://autopilot.app',
  privacyPolicyUrl: 'https://autopilot.app/privacy',
  termsUrl: 'https://autopilot.app/terms',
};

export default IMPORTANT_VARS;
