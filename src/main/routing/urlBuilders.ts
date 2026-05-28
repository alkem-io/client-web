import { _AUTH_LOGIN_PATH, AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { isAbsoluteUrl } from '@/core/utils/links';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { DIALOG_PARAM_VALUES } from '@/main/topLevelPages/myDashboard/useMyDashboardDialogs';

export const KNOWLEDGE_BASE_PATH = 'knowledge-base';
export const URL_SPACE_EXPLORER = '/spaces';

// Keep these in sync with the consts in TabbedLayoutPage.tsx and don't import,
// tests fail to import because they are in different modules
const URL_PARAM_SECTION = 'tab';
const URL_PARAM_DIALOG = 'dialog';

export enum TabbedLayoutParams {
  Section = URL_PARAM_SECTION,
  Dialog = URL_PARAM_DIALOG,
}

export const buildSettingsUrl = (entityUrl: string) => {
  return `${entityUrl}/settings`;
};

// Single migration point for the L1 settings link. Returns the legacy MUI
// settings URL until the SubSpace settings page is itself CRD-migrated.
export const buildSubspaceSettingsUrl = (subspaceUrl: string) => buildSettingsUrl(subspaceUrl);

export const buildNotificationSettingsUrl = (entityUrl: string) => {
  return `${entityUrl}/settings/notifications`;
};

export const buildSettingsCommunityUrl = (entityUrl: string) => {
  return `${buildSettingsUrl(entityUrl)}/community`;
};

export const buildVCKnowledgeBaseUrl = (vcUrl: string = '.') => `${vcUrl}/${KNOWLEDGE_BASE_PATH}`;

export const buildReturnUrlParam = (returnUrl = ROUTE_HOME, origin = window.location.origin) => {
  const fullReturnUrl = isAbsoluteUrl(returnUrl) ? returnUrl : `${origin}${returnUrl}`;
  return `?returnUrl=${encodeURI(fullReturnUrl)}`;
};

export const hasReturnUrlParam = (params?: string) => params?.includes('returnUrl=');

export const buildLoginUrl = (returnUrl?: string, params?: string) => {
  if (hasReturnUrlParam(params)) {
    return `${_AUTH_LOGIN_PATH}${params}`;
  }

  return `${_AUTH_LOGIN_PATH}${buildReturnUrlParam(returnUrl)}`;
};

export const buildSignUpUrl = (returnUrl?: string, params?: string) => {
  if (hasReturnUrlParam(params)) {
    return `${AUTH_SIGN_UP_PATH}${params}`;
  }

  return `${AUTH_SIGN_UP_PATH}${buildReturnUrlParam(returnUrl)}${params ? params : ''}`;
};

export const buildUpdatesUrl = (spaceUrl: string) => {
  return `${spaceUrl}/updates`;
};

export const buildSpaceSectionUrl = (
  spaceUrl: string = '',
  sectionNumber: number = 0,
  dialog: string | undefined = undefined
) => {
  let result = '';
  const params = new URLSearchParams(window.location.search);

  try {
    const url = new URL(spaceUrl); // Parse the URL and extract the pathname if it's absolute
    result = url.pathname;
  } catch {
    result = spaceUrl; // If the URL is not absolute, use it as is
  }

  if (sectionNumber) {
    params.set(URL_PARAM_SECTION, sectionNumber.toString());
  }
  if (dialog) {
    params.set(URL_PARAM_DIALOG, dialog);
  } else {
    params.delete(URL_PARAM_DIALOG);
  }

  return `${result}?${params.toString()}`;
};

export const buildInnovationPackSettingsUrl = buildSettingsUrl;

export const buildInnovationHubUrl = (subdomain: string): string => {
  if (!window || !window.location) {
    throw new Error("Couldn't determine the base URL");
  }

  const { hostname, protocol, origin } = window.location;
  if (import.meta.env.MODE === 'development') {
    // For localhost return always the base URL
    if (subdomain) {
      return `${origin}/?subdomain=${subdomain}`;
    } else {
      return origin;
    }
  } else {
    // get the last 2 parts of the hostname: ['xx-alkem', 'io']
    const domain = hostname.split('.').slice(-2);
    if (subdomain) {
      return `${protocol}//${subdomain}.${domain.join('.')}`;
    } else {
      return `${protocol}//${domain.join('.')}`;
    }
  }
};

/**
 * Normalise `locations.domain` into a fully-qualified origin (`<protocol>//<host>`).
 *
 * The Configuration GraphQL field is documented as a bare host (e.g. `alkemio.org`)
 * but some environments ship a full URL (`http://localhost:3000`) — this helper
 * tolerates both shapes so consumers never have to second-guess the format.
 *
 * - `'alkemio.org'`           → `'https://alkemio.org'` (or matches page protocol)
 * - `'http://localhost:3000'` → `'http://localhost:3000'` (used verbatim, trailing slash stripped)
 * - `''` / `undefined`        → `undefined`
 */
const normaliseLocationOrigin = (domain: string | undefined): string | undefined => {
  if (!domain) return undefined;
  const trimmed = domain.replace(/\/+$/, '');
  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return trimmed;
  }
  // Bare host — use the page's current protocol so `//<host>` works in both
  // http (dev) and https (prod) without forcing one.
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  return `${protocol}//${trimmed}`;
};

/**
 * Build an absolute URL to the canonical platform host (`locations.domain`)
 * for an in-app `path`. Used by every call site that wants to navigate to the
 * main domain regardless of where the visitor currently is — top nav off a
 * hub subdomain, the "Browse all Spaces on Alkemio" CTA, etc.
 *
 * Returns the path unchanged when no `domain` is configured (graceful
 * fallback — clicking the link stays on the current host).
 */
export const buildMainDomainUrl = (path: string, canonicalDomain: string | undefined): string => {
  const origin = normaliseLocationOrigin(canonicalDomain);
  if (!origin) return path;
  // Already absolute — leave alone.
  if (/^[a-z]+:\/\//i.test(path) || path.startsWith('//')) {
    return path;
  }
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * True when the current host is a sub-host of the configured canonical domain
 * — used as the signal "we're on a hub subdomain" by the top navigation. On
 * development (no real subdomains on `localhost`) this is always `false`.
 *
 * Tolerates `locations.domain` shaped as either a bare host or a full URL:
 * the host portion is extracted before the suffix check.
 */
export const isOnHubSubdomain = (canonicalDomain: string | undefined): boolean => {
  if (import.meta.env.MODE !== 'production' || !canonicalDomain || typeof window === 'undefined') {
    return false;
  }
  // Strip protocol/path from the configured value so the suffix match works
  // regardless of whether the config ships a bare host or a full URL.
  const canonicalHost = canonicalDomain
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '');
  const { hostname } = window.location;
  return hostname !== canonicalHost && hostname.endsWith(`.${canonicalHost}`);
};

/**
 * Absolutise an in-app path against the canonical platform host when the
 * visitor is on a hub subdomain. Used by the top navigation so clicking "Home"
 * or any other platform link hops the user off the subdomain back to the main
 * domain. On dev (or when already on the canonical host), returns the path
 * unchanged.
 */
export const absolutiseToMainDomain = (path: string, canonicalDomain: string | undefined): string => {
  if (!isOnHubSubdomain(canonicalDomain)) {
    return path;
  }
  return buildMainDomainUrl(path, canonicalDomain);
};

export const buildUserAccountUrl = (profileUrl?: string) => {
  return profileUrl ? `${buildSettingsUrl(profileUrl)}/account` : '';
};

export const buildMembershipSettingsUrl = (profileUrl?: string) => {
  return profileUrl ? `${buildSettingsUrl(profileUrl)}/membership` : '';
};

// Generic per-tab settings URL composer used by the CRD contributor settings
// shells (User + Organization). Caller passes the entity's `profile.url` and a
// tab id; never call sites template `/user/<nameId>/settings/<tab>` by hand.
export const buildSettingsTabUrl = (profileUrl: string | undefined, tabId: string) => {
  return profileUrl ? `${buildSettingsUrl(profileUrl)}/${tabId}` : '';
};

export const buildWelcomeSpaceUrl = () => '/welcome-space';

export const getInvitationsDialogUrl = () => `/home?${URL_PARAM_DIALOG}=${DIALOG_PARAM_VALUES.INVITATIONS}`;

const VIDEO_CALL_BASE_URL = 'https://meet.jit.si/';

export const buildVideoCallUrl = (videoUrlId?: string, spaceNameId?: string) => {
  if (!videoUrlId || !spaceNameId) {
    return '';
  }

  const meetingIdentifier = `${encodeURIComponent(spaceNameId)}-${encodeURIComponent(videoUrlId)}`;
  return `${VIDEO_CALL_BASE_URL}${meetingIdentifier}`;
};
