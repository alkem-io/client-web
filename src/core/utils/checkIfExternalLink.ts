export const isExternalLink = (link: string): boolean => {
  if (link.startsWith('//') || /https?:/.test(link)) {
    return !link.startsWith(window.origin);
  }
  return false;
};
