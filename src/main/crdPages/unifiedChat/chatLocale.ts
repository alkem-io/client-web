const baseLanguage = (tag: string) => tag.split('-')[0].toLowerCase();

/**
 * The locale chat times are formatted in. The app language decides the words,
 * but it carries no region ("en"), and the region is what decides between 14:32
 * and 2:32 PM. The browser's preferred locales usually carry it ("en-GB"), so
 * the first one in the app language is used when there is one.
 */
export const resolveChatLocale = (
  appLanguage: string | undefined,
  browserLanguages: readonly string[]
): string | undefined => {
  if (!appLanguage) return undefined;
  const base = baseLanguage(appLanguage);
  return browserLanguages.find(tag => baseLanguage(tag) === base) ?? appLanguage;
};
