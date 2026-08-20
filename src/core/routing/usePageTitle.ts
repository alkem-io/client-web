import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setBaseTitle } from './documentTitle';

interface UsePageTitleOptions {
  /**
   * Override the default "Alkemio" suffix
   */
  suffix?: string;
  /**
   * When true, displays only the title without any suffix.
   * Useful for the home page where we want just "Alkemio".
   */
  skipSuffix?: boolean;
}

/**
 * Hook to set the browser tab title dynamically.
 *
 * @param title - The page-specific title context (e.g., space name, "Forum", etc.)
 * @param options - Optional configuration for title formatting
 *
 * @example
 * // Static page with i18n
 * usePageTitle(t('pages.titles.forum')); // "Forum | Alkemio"
 *
 * @example
 * // Dynamic page with entity name
 * usePageTitle(space.about.profile.displayName); // "[Space Name] | Alkemio"
 *
 * @example
 * // Home page without suffix
 * usePageTitle('Alkemio', { skipSuffix: true }); // "Alkemio"
 */
export const usePageTitle = (title: string | undefined, options?: UsePageTitleOptions): void => {
  const { t } = useTranslation();
  const separator = t('pages.titles.separator');
  const { suffix = t('pages.titles.alkemio'), skipSuffix = false } = options ?? {};

  useEffect(() => {
    // Write the base title through the documentTitle singleton so the unread
    // tab-badge prefix and the page title never race for `document.title`.
    if (skipSuffix) {
      setBaseTitle(title || suffix);
    } else if (!title) {
      setBaseTitle(suffix);
    } else {
      setBaseTitle(`${title}${separator}${suffix}`);
    }
  }, [title, suffix, skipSuffix, separator]);
};
