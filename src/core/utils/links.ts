export const isAbsoluteUrl = (link: string) => link.startsWith('//') || /https?:/.test(link);

export const hasSameOrigin = (link: string) => link.startsWith(window.origin);

const getDomainLikeRegexp = () => /^(\w+\.)+\w+(\/.*)?/;

export const hasDomainLike = (link: string) => getDomainLikeRegexp().test(link);

export const hasSameHost = (link: string) => link.startsWith(window.location.host);

export const normalizeLink = (link: string) => {
  if (isAbsoluteUrl(link) && hasSameOrigin(link)) {
    return link.slice(window.origin.length) || '/';
  } else {
    if (process.env.NODE_ENV === 'development' && link.startsWith('localhost')) {
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
