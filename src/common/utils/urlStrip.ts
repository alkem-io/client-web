export const urlStrip = (url: string, length: number = 1) => {
  let stripLength = length;
  const split = url.split('/');
  if (url.endsWith('/')) {
    stripLength++;
  }
  return split.slice(0, split.length - stripLength).join('/');
};
