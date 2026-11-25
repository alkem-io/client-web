/**
 * Is the page running as an installed PWA (workspace#121)? `public/manifest.json` declares
 * `display: standalone`, so the installed app has no browser reload button and no browser
 * pull-to-refresh. iOS home-screen apps report it through `navigator.standalone` instead.
 * Decides UI only (whether to offer a reload or pull-to-refresh), never identity or access.
 */

declare global {
  interface Navigator {
    /** iOS Safari only: true when launched from the home screen. */
    standalone?: boolean;
  }
}

export const isStandaloneDisplay = (): boolean =>
  window.matchMedia?.('(display-mode: standalone)').matches === true || navigator.standalone === true;
