import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { claimDialogTitle, type DialogTitleClaim, type DialogTitleComposer } from './documentTitle';

/**
 * Shows `title` in the browser tab while `enabled` is true, in place of the page
 * title, as `<title> | <page name> | Alkemio` (e.g. the post, then its Space).
 * Names are shown in full; the browser cuts the tab label and shows the whole title on hover.
 * When `enabled` turns false or the caller unmounts, the page title comes back.
 *
 * Dialogs may stack (a task's dialog over its board): the newest open one is
 * shown, and closing it shows the one beneath.
 */
export const useDialogTitle = (title: string | undefined, enabled: boolean): void => {
  const { t } = useTranslation();
  const separator = t('pages.titles.separator');
  const suffix = t('pages.titles.alkemio');
  const composeRef = useRef<DialogTitleComposer>(() => '');
  const claimRef = useRef<DialogTitleClaim | null>(null);

  // A title change updates the claim in place, so a dialog renamed while another
  // is open on top of it does not move above that one.
  useEffect(() => {
    composeRef.current = pageName =>
      [title, pageName]
        .filter((part): part is string => Boolean(part?.trim()))
        .concat(suffix)
        .join(separator);
    claimRef.current?.update(composeRef.current);
  }, [title, separator, suffix]);

  useEffect(() => {
    if (!enabled) return;
    const claim = claimDialogTitle(composeRef.current);
    claimRef.current = claim;
    return () => {
      claim.release();
      claimRef.current = null;
    };
  }, [enabled]);
};
