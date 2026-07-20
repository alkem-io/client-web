/**
 * The single owner of `document.title`.
 *
 * `document.title` is written from ~25 `usePageTitle()` call sites; an unread
 * badge hook that simply assigns the title would race with whichever page effect
 * runs last on navigation. This singleton splits ownership into two parts — the
 * page `base` (set by `usePageTitle`) and an unread `prefix` (set by the tab
 * badge) — and deterministically recomposes `` `${prefix}${base}` `` whenever
 * either changes.
 */

let base = typeof document !== 'undefined' ? document.title : '';
let prefix = '';

const apply = () => {
  if (typeof document !== 'undefined') {
    document.title = `${prefix}${base}`;
  }
};

/** Set the page-specific base title (owned by `usePageTitle`). */
export const setBaseTitle = (nextBase: string): void => {
  base = nextBase;
  apply();
};

/** Set the unread-count prefix (owned by the tab badge); `''` clears it. */
export const setTitlePrefix = (nextPrefix: string): void => {
  prefix = nextPrefix;
  apply();
};
