import { useEffect } from 'react';
import { setDialogTitle } from './documentTitle';
import { useComposedTitle } from './usePageTitle';

/**
 * Shows `title` in the browser tab (as `<title> | Alkemio`) while `enabled` is
 * true, in place of the page title. When `enabled` turns false or the caller
 * unmounts, the page title the tab showed before comes back unchanged.
 *
 * Only one dialog claims the tab at a time: the callout detail dialog is modal,
 * so a second one cannot be opened on top of it.
 */
export const useDialogTitle = (title: string | undefined, enabled: boolean): void => {
  const fullTitle = useComposedTitle(title);

  useEffect(() => {
    if (!enabled) return;
    setDialogTitle(fullTitle);
    return () => setDialogTitle(null);
  }, [enabled, fullTitle]);
};
