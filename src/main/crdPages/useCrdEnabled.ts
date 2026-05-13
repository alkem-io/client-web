/**
 * Numeric design-version values mirroring the server-side `UserSettings.designVersion`
 * field. The server reserves `3+` for future generations; the client only ever
 * writes one of these two.
 */
export const DESIGN_VERSION_OLD = 1;
export const DESIGN_VERSION_NEW = 2;
export type DesignVersion = typeof DESIGN_VERSION_OLD | typeof DESIGN_VERSION_NEW;

/** Current LocalStorage key — stores the design version as a stringified integer ("1" / "2"). */
export const DESIGN_VERSION_STORAGE_KEY = 'alkemio-design-version';

/**
 * Legacy LocalStorage key used before the move to a versioned design preference.
 * Kept only so the migration below can flush it on first load.
 *
 * TODO: Remove `CRD_TOGGLE_STORAGE_KEY` and the `migrateLegacyDesignVersionLS`
 * IIFE in a future release once all returning users have migrated (target:
 * ~3 releases / 4–6 weeks of production presence after #099 ships).
 */
export const CRD_TOGGLE_STORAGE_KEY = 'alkemio-crd-enabled';

(function migrateLegacyDesignVersionLS() {
  try {
    if (localStorage.getItem(DESIGN_VERSION_STORAGE_KEY) !== null) return;
    const legacy = localStorage.getItem(CRD_TOGGLE_STORAGE_KEY);
    if (legacy === null) return;
    const migrated = legacy === 'true' ? DESIGN_VERSION_NEW : DESIGN_VERSION_OLD;
    localStorage.setItem(DESIGN_VERSION_STORAGE_KEY, String(migrated));
    localStorage.removeItem(CRD_TOGGLE_STORAGE_KEY);
  } catch {
    // Private-mode browsers may block localStorage — nothing to migrate.
  }
})();

export function readDesignVersionFromStorage(): DesignVersion | null {
  try {
    const raw = localStorage.getItem(DESIGN_VERSION_STORAGE_KEY);
    if (raw === String(DESIGN_VERSION_OLD)) return DESIGN_VERSION_OLD;
    if (raw === String(DESIGN_VERSION_NEW)) return DESIGN_VERSION_NEW;
    return null;
  } catch {
    return null;
  }
}

export function writeDesignVersionToStorage(version: DesignVersion): void {
  try {
    localStorage.setItem(DESIGN_VERSION_STORAGE_KEY, String(version));
  } catch {
    // Ignore — privacy-mode browsers may block localStorage.
  }
}

export function useCrdEnabled(): boolean {
  return readDesignVersionFromStorage() === DESIGN_VERSION_NEW;
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
 */
export function disableCrdAndNavigate(targetUrl: string): void {
  try {
    localStorage.removeItem(DESIGN_VERSION_STORAGE_KEY);
    // Legacy key — remove together with the migration block above.
    localStorage.removeItem(CRD_TOGGLE_STORAGE_KEY);
  } catch {
    // Ignore — privacy-mode browsers may block localStorage.
  }
  window.location.assign(targetUrl);
}
