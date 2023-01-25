// TODO: format dates in a better way.
// support en-us format mm/dd??
export const formatBadgeDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
};

export const formatLongDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};