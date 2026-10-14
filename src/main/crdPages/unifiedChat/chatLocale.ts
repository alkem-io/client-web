const baseLanguage = (tag: string) => tag.split('-')[0].toLowerCase();

/**
 * The locale chat times are formatted in. The app language decides the words,
 * but it carries no region ("en"), and the region is what decides between 14:32
 * and 2:32 PM. The browser's preferred locales usually carry it ("en-GB"), so
 * the first one in the app language is used when there is one. When the browser
 * speaks another language (English app, Dutch browser), the words stay in the
 * app language and only the browser's 12/24-hour clock is carried over.
 */
export const resolveChatLocale = (
  appLanguage: string | undefined,
  browserLanguages: readonly string[]
): string | undefined => {
  if (!appLanguage) return undefined;
  const base = baseLanguage(appLanguage);
  const regional = browserLanguages.find(tag => baseLanguage(tag) === base);
  if (regional) return regional;
  const browser = browserLanguages[0];
  if (!browser) return appLanguage;
  const { hourCycle } = new Intl.DateTimeFormat(browser, { hour: 'numeric' }).resolvedOptions();
  return hourCycle ? `${appLanguage}-u-hc-${hourCycle}` : appLanguage;
};
