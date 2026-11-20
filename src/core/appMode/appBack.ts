/**
 * The web side of the app shell's OS Back button.
 *
 * The native shell (`client-appstore`) asks the page, on every Back press,
 * whether it consumed the press: `window.alkemioApp.handleBack()` returns
 * `true` when the page handled it (an overlay closed, or the topmost layer
 * deliberately refused Escape) and `false` when the shell should navigate
 * history as before.
 *
 * Back is Escape on the topmost layer. The page already keeps the only overlay
 * stack that matters — Radix dismissable layers, plus the few custom overlays
 * that claim Escape through `claimEscape` — so this dispatches one cancelable
 * Escape and reports whether anybody claimed it. There is no registry.
 *
 * The event is dispatched on `document.body`, never on the focused element:
 * document/window listeners (every overlay) see it, while handlers on a focused
 * descendant (a canvas, an input) do not, so a focused editor can never make
 * the answer `true` by itself.
 *
 * Installed unconditionally: a browser never calls it, so it is inert there.
 */

/** A mounted element carrying this attribute makes Back pass through to history. */
export const APP_BACK_PASS_ATTR = 'data-app-back';
export const APP_BACK_PASS_VALUE = 'pass';
export const APP_BACK_CONTRACT_VERSION = 1 as const;

/** Back == Escape on the topmost layer. Never throws. */
export const handleAppBack = (doc: Document = document): boolean => {
  try {
    // A no-exit gate (a page-wide dialog that refuses Escape) would otherwise
    // trap Back forever; answer false without dispatching anything.
    if (doc.querySelector(`[${APP_BACK_PASS_ATTR}="${APP_BACK_PASS_VALUE}"]`)) return false;
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    doc.body.dispatchEvent(escapeEvent);
    return escapeEvent.defaultPrevented;
  } catch {
    return false;
  }
};

export const installAppBack = (win: Window = window): void => {
  win.alkemioApp = { version: APP_BACK_CONTRACT_VERSION, handleBack: () => handleAppBack(win.document) };
};

declare global {
  interface Window {
    alkemioApp?: { version: 1; handleBack(): boolean };
  }
}
