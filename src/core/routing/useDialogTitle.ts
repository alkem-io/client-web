import { useEffect } from 'react';
import { claimDialogTitle } from './documentTitle';
import { useComposedTitle } from './usePageTitle';

/**
 * Shows `title` in the browser tab (as `<title> | Alkemio`) while `enabled` is
 * true, in place of the page title. When `enabled` turns false or the caller
 * unmounts, the page title the tab showed before comes back unchanged.
 *
 * Dialogs may stack (a task's dialog over its board): the newest open one is
 * shown, and closing it shows the one beneath.
 */
export const useDialogTitle = (title: string | undefined, enabled: boolean): void => {
  const fullTitle = useComposedTitle(title);

  useEffect(() => {
    if (!enabled) return;
    return claimDialogTitle(fullTitle);
  }, [enabled, fullTitle]);
};
