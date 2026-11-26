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

/** Builds a dialog's tab title from the name of the page it is open on (undefined when the page has none). */
export type DialogTitleComposer = (pageName: string | undefined) => string;

let base = typeof document !== 'undefined' ? document.title : '';
let pageName: string | undefined;
let prefix = '';
let override: string | null = null;
const dialogClaims: { compose: DialogTitleComposer }[] = [];

const apply = () => {
  if (typeof document !== 'undefined') {
    const dialogTitle = dialogClaims[dialogClaims.length - 1]?.compose(pageName);
    document.title = `${prefix}${override ?? dialogTitle ?? base}`;
  }
};

/** Set the page-specific base title and the page's own name (owned by `usePageTitle`). */
export const setBaseTitle = (nextBase: string, nextPageName?: string): void => {
  base = nextBase;
  pageName = nextPageName;
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

export type DialogTitleClaim = {
  /** Change the claim's title without moving it in the stack. */
  update: (compose: DialogTitleComposer) => void;
  release: () => void;
};

/**
 * Show an open dialog's title in place of the page base title until the claim is
 * released. The title is rebuilt from the current page name on every change, so
 * it follows the page it is open on.
 */
export const claimDialogTitle = (compose: DialogTitleComposer): DialogTitleClaim => {
  const claim = { compose };
  dialogClaims.push(claim);
  apply();
  return {
    update: nextCompose => {
      claim.compose = nextCompose;
      apply();
    },
    release: () => {
      const index = dialogClaims.indexOf(claim);
      if (index !== -1) {
        dialogClaims.splice(index, 1);
        apply();
      }
    },
  };
};
