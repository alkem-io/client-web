export const CRD_TOGGLE_STORAGE_KEY = 'alkemio-crd-enabled';

export function useCrdEnabled(): boolean {
  try {
    return localStorage.getItem(CRD_TOGGLE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Imperatively disable the CRD design-system toggle and hard-navigate to a
 * legacy MUI URL. Used by CRD-only fallback affordances (e.g. the VC Settings
 * "Open in legacy view" CTA on the Prompt Graph fallback tile) that point at
 * pages still owned by the MUI shell.
 *
 * A full reload via `window.location.assign` is required — the CRD/MUI choice
 * is made at app boot when `useCrdEnabled()` is read by the route dispatchers,
 * so client-side `useNavigate` would resolve back to the CRD shell.
 *
 * Generic by design — future fallback CTAs from other CRD pages can reuse
 * this verbatim. Always check via Admin UI or this helper rather than
 * touching `CRD_TOGGLE_STORAGE_KEY` inline at call sites.
 */
export function disableCrdAndNavigate(targetUrl: string): void {
  try {
    localStorage.removeItem(CRD_TOGGLE_STORAGE_KEY);
  } catch {
    // Ignore — privacy-mode browsers may block localStorage, in which case
    // the toggle was never persisted in the first place.
  }
  window.location.assign(targetUrl);
}
