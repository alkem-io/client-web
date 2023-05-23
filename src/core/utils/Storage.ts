const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

const unitSize = 1024;

export const formatFileSize = (fileSize: number | undefined, decimalPlaces: number = 2): string => {
  if (!fileSize || fileSize <= 0) {
    return '';
  }
  const u = Math.floor(Math.log(fileSize) / Math.log(unitSize));
  return (fileSize / Math.pow(unitSize, u)).toFixed(u === 0 ? 0 : decimalPlaces) + ' ' + units[u];
};
