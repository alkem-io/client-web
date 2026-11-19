import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { claimDialogTitle } from './documentTitle';

/** Longest a title part may be in a dialog's tab title, counting the ellipsis. */
export const TITLE_PART_MAX_LENGTH = 11;

/** Shortens one tab title part to `TITLE_PART_MAX_LENGTH` characters, ending in `…` when cut. */
export const shortenTitlePart = (part: string): string => {
  // Count code points so an emoji or accented letter is never split in half.
  const chars = Array.from(part.trim());
  if (chars.length <= TITLE_PART_MAX_LENGTH) return chars.join('');
  return `${chars
    .slice(0, TITLE_PART_MAX_LENGTH - 1)
    .join('')
    .trimEnd()}…`;
};

/**
 * Shows `title` in the browser tab while `enabled` is true, in place of the page
 * title, as `<title> | <page name> | Alkemio` (e.g. the post, then its Space).
 * Each part except "Alkemio" is shortened to `TITLE_PART_MAX_LENGTH` characters.
 * When `enabled` turns false or the caller unmounts, the page title comes back.
 *
 * Dialogs may stack (a task's dialog over its board): the newest open one is
 * shown, and closing it shows the one beneath.
 */
export const useDialogTitle = (title: string | undefined, enabled: boolean): void => {
  const { t } = useTranslation();
  const separator = t('pages.titles.separator');
  const suffix = t('pages.titles.alkemio');

  useEffect(() => {
    if (!enabled) return;
    return claimDialogTitle(pageName =>
      [title, pageName]
        .filter((part): part is string => Boolean(part?.trim()))
        .map(shortenTitlePart)
        .concat(suffix)
        .join(separator)
    );
  }, [enabled, title, separator, suffix]);
};
