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

/**
 * Resolve a persisted `returnUrl` to a safe in-platform path, or `null` when it
 * points anywhere else.
 *
 * Returns a path (`pathname + search + hash`), never an origin, so the caller
 * decides which origin to prefix — always the apex, never the identity
 * subdomain. Two origins are accepted: the apex (`platformOrigin`) and the
 * current one, because the sign-up / verify / recovery screens are served from
 * `identity.<domain>` in every deployed environment and link back to `/login`
 * relatively.
 *
 * The `returnUrl` cookie is scoped to the base domain, so any subdomain can set
 * it — validating here is what stops it being used as an open redirect.
 */
export const resolveInternalReturnPath = (
  raw: string | undefined,
  platformOrigin: string | undefined
): string | null => {
  if (!raw?.trim()) {
    return null;
  }

  const allowedOrigins = [platformOrigin, window.location.origin].filter(Boolean);

  try {
    const url = new URL(raw, platformOrigin ?? window.location.origin);
    if (!allowedOrigins.includes(url.origin)) {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}` || '/';
  } catch {
    return raw.startsWith('/') ? raw : null;
  }
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
