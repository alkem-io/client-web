/**
 * The single owner of `document.title`.
 *
 * `document.title` is written from ~25 `usePageTitle()` call sites; an unread
 * badge hook that simply assigns the title would race with whichever page effect
 * runs last on navigation. This singleton splits ownership into two parts — the
 * page `base` (set by `usePageTitle`) and an unread `prefix` (set by the tab
 * badge) — and deterministically recomposes `` `${prefix}${base}` `` whenever
 * either changes.
 *
 * An open dialog that represents its own entity (the callout detail dialog) may
 * stand in for the page base via `setDialogTitle`; clearing it shows the base
 * again without the page having to re-run its effect. The badge `override`
 * still wins over it, and the `prefix` composes on top of whichever is shown.
 */

let base = typeof document !== 'undefined' ? document.title : '';
let prefix = '';
let override: string | null = null;
let dialogTitle: string | null = null;

const apply = () => {
  if (typeof document !== 'undefined') {
    document.title = `${prefix}${override ?? dialogTitle ?? base}`;
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

/** Show `text` in place of the page base title (owned by the tab badge); `null` restores the base. */
export const setTitleOverride = (text: string | null): void => {
  override = text;
  apply();
};

/** Show an open dialog's title in place of the page base title; `null` restores the base. */
export const setDialogTitle = (text: string | null): void => {
  dialogTitle = text;
  apply();
};
