export const adjustServerDateForTimezone = (date: Date | string): Date => {
  const browserOffset = new Date().getTimezoneOffset();
  const timestamp = Date.parse(date.toString()) - browserOffset * 60 * 1000;
  return new Date(timestamp);
};
