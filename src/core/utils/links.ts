export const isAbsoluteUrl = (link: string) => link.startsWith('//') || /https?:/.test(link);

export const hasSameOrigin = (link: string) => link.startsWith(window.origin);

const getDomainLikeRegexp = () => /^(\w+\.)+\w+(\/.*)?/;

export const hasDomainLike = (link: string) => getDomainLikeRegexp().test(link);

export const hasSameHost = (link: string) => link.startsWith(window.location.host);

export const normalizeLink = (link: string) => {
  if (
    isAbsoluteUrl(link) &&
    hasSameOrigin(link) &&
    // Keep file attachment urls in absolute format, they are not handled by React Router anyway
    !isFileAttachmentUrl(link)
  ) {
    return link.slice(window.origin.length) || '/';
  } else {
    if (import.meta.env.MODE === 'development' && link.startsWith('localhost')) {
      return /[^/]*(\/.*)?/.exec(link)?.[1] ?? '/';
    }
    const match = getDomainLikeRegexp().exec(link);
    if (match) {
      if (hasSameHost(link)) {
        return match[2] ?? '/';
      } else {
        return `//${link}`;
      }
    }
  }
  return link;
};

const PRIVATE_STORAGE_ROOT_PATH = '/api/private/rest/storage/';

export const isFileAttachmentUrl = (link: string) => {
  let path = link;
  if (isAbsoluteUrl(link)) {
    if (!hasSameOrigin(link)) {
      return false;
    }
    path = link.slice(window.origin.length);
  }
  return path.startsWith(PRIVATE_STORAGE_ROOT_PATH);
};
