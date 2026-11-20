/** Medium date + short time in the active locale; empty for an unparseable value. */
export const formatFormDate = (value: Date | string, locale?: string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch {
    return date.toLocaleString();
  }
};
