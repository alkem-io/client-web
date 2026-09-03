/**
 * Remembers the rendered height of each feed callout card (per viewport width) across
 * mounts and full page reloads, so the next time the card is loading its placeholder
 * can reserve exactly the space the card will take (issue #10043 — layout jump).
 *
 * Heights are keyed by `<calloutId>@<variant>@<viewport width>` — a card's height only
 * holds for the width it was measured at AND for the rendering variant (the same callout
 * is taller in the normal feed than forced-collapsed in search results, and wraps
 * differently in the full-width layout). The store lives in `sessionStorage` (every in-app
 * CRD navigation is a full reload, so an in-memory map alone would rarely survive) with an
 * in-memory mirror, and is best-effort: storage failures fall back to memory only.
 */

const STORAGE_KEY = 'alkemio_callout_heights';
const MAX_ENTRIES = 300;
/** Writes are coalesced: a ResizeObserver can fire per frame during a resize drag. */
const PERSIST_DELAY_MS = 250;

let heights: Map<string, number> | undefined;
let persistTimer: ReturnType<typeof setTimeout> | undefined;
let flushOnPageHideRegistered = false;

function readStore(): Map<string, number> {
  if (heights) {
    return heights;
  }
  heights = new Map();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      for (const [key, value] of Object.entries(JSON.parse(raw) as Record<string, unknown>)) {
        if (typeof value === 'number') {
          heights.set(key, value);
        }
      }
    }
  } catch {
    // sessionStorage unavailable or corrupt — keep the in-memory map only.
  }
  return heights;
}

function flushPersist() {
  if (persistTimer !== undefined) {
    clearTimeout(persistTimer);
    persistTimer = undefined;
  }
  if (!heights) {
    return;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(heights)));
  } catch {
    // Quota / privacy mode — the in-memory map still serves this session.
  }
}

function schedulePersist() {
  if (!flushOnPageHideRegistered) {
    flushOnPageHideRegistered = true;
    // Every CRD navigation is a full reload: flush whatever is pending before the page goes.
    window.addEventListener('pagehide', flushPersist);
  }
  if (persistTimer === undefined) {
    persistTimer = setTimeout(flushPersist, PERSIST_DELAY_MS);
  }
}

const storageKey = (calloutId: string, variant: string) => `${calloutId}@${variant}@${window.innerWidth}`;

export function getRememberedCalloutHeight(calloutId: string, variant: string): number | undefined {
  return readStore().get(storageKey(calloutId, variant));
}

export function rememberCalloutHeight(calloutId: string, variant: string, height: number) {
  const store = readStore();
  const key = storageKey(calloutId, variant);
  const rounded = Math.round(height);
  if (rounded <= 0 || store.get(key) === rounded) {
    return;
  }
  // Re-insert so the key moves to the end: Map keeps insertion order, so the
  // oldest entries are the first ones and get evicted first.
  store.delete(key);
  store.set(key, rounded);
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    store.delete(oldest);
  }
  schedulePersist();
}

type UseRememberedCalloutHeightParams = {
  calloutId: string;
  /**
   * Distinguishes renderings of the same callout that differ in height at the same viewport
   * width (normal feed vs forced-collapsed search results, default vs full-width layout).
   */
  variant: string;
  /**
   * True while the card is in a transient state its next mount won't reproduce (inline
   * comments opened, description toggled by the user) — the height is not recorded then,
   * so the placeholder keeps matching the card as it mounts.
   */
  paused?: boolean;
};

/**
 * Returns the remembered height for the card (if any) as the exact `height` for whichever
 * placeholder stands in for it — the not-yet-loaded skeleton AND the Suspense fallback shown
 * while the loaded card's subtree is still resolving — plus a `ref` to attach to the element
 * wrapping the real card once it has mounted: its height is tracked (ResizeObserver, so
 * late-arriving images and contributions are included) and remembered for the next visit.
 * The ref is a callback with cleanup, so it only ever observes the mounted card — never the
 * Suspense fallback that precedes it.
 */
export function useRememberedCalloutHeight({ calloutId, variant, paused = false }: UseRememberedCalloutHeightParams) {
  const ref = (element: HTMLDivElement | null) => {
    if (!element || paused) {
      return;
    }
    const observer = new ResizeObserver(() => rememberCalloutHeight(calloutId, variant, element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  };

  return { ref, height: getRememberedCalloutHeight(calloutId, variant) };
}
