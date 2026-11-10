/**
 * The single owner of `document.title`.
 *
 * `document.title` is written from ~25 `usePageTitle()` call sites; an unread
 * badge hook that simply assigns the title would race with whichever page effect
 * runs last on navigation. This singleton splits ownership into two parts — the
 * page `base` (set by `usePageTitle`) and an unread `prefix` (set by the tab
 * badge) — and deterministically recomposes
 * `` `${prefix}${override ?? dialogTitle ?? base}` `` whenever any part changes.
 *
 * An open dialog that represents its own entity (a callout dialog, a task board)
 * may stand in for the page base via `claimDialogTitle`. Claims are owned: the
 * newest open claim is shown, and releasing one never clears another (a task's
 * dialog opens on top of its board), so closing every dialog shows the base
 * again without the page having to re-run its effect. The badge `override`
 * still wins over a dialog title, and the `prefix` composes on top.
 */

let base = typeof document !== 'undefined' ? document.title : '';
let prefix = '';
let override: string | null = null;
const dialogClaims: { title: string }[] = [];

const apply = () => {
  if (typeof document !== 'undefined') {
    const dialogTitle = dialogClaims[dialogClaims.length - 1]?.title;
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

/** Show an open dialog's title in place of the page base title until the returned release is called. */
export const claimDialogTitle = (text: string): (() => void) => {
  const claim = { title: text };
  dialogClaims.push(claim);
  apply();
  return () => {
    const index = dialogClaims.indexOf(claim);
    if (index !== -1) {
      dialogClaims.splice(index, 1);
      apply();
    }
  };
};
