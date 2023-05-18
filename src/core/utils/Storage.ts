/**
 * Return Human readable file size
 * https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
 * @param fileSize
 * @param decimalPlaces
 */

export const formatFileSize = (fileSize: number | undefined, decimalPlaces: number = 2): string => {
  if (!fileSize || fileSize <= 0) {
    return '';
  } else if (Math.abs(fileSize) < 1024) {
    return fileSize + ' B';
  }

  const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let u = -1;
  const r = 10 ** decimalPlaces;

  do {
    fileSize /= 1024;
    ++u;
  } while (Math.round(Math.abs(fileSize) * r) / r >= 1024 && u < units.length - 1);

  return fileSize.toFixed(decimalPlaces) + ' ' + units[u];
};

