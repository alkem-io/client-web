import type { V2ConfigurationQuery } from '@/core/apollo/generated-v2/graphql-schema';

// Config.links keys as declared (Q12 inventory, ruled 2026-10-21); domain is the apex origin with scheme.
const V2_LINK_KEYS = ['terms', 'privacy', 'support', 'documentation', 'domain', 'security', 'about'] as const;
export type V2PlatformLinkKey = (typeof V2_LINK_KEYS)[number];

export type V2PlatformConfig = {
  platformId: string;
  languages: string[];
  defaultLanguage: string;
  // core.platform_settings value schema (server-go schema.sql): boolean flags keyed by declared name
  features: Record<string, boolean>;
  iframeAllowlist: string[];
  vapidPublicKey: string | undefined;
  storage: { maxFileSize: number; allowedMime: string[] };
  kratosPublicUrl: string;
  links: Partial<Record<V2PlatformLinkKey, string>>;
  // Our native Matrix homeserver ('One API: native Matrix'): the client API base and the server name in room / user ids.
  matrix: { homeserverUrl: string; serverName: string; sessionBaseUrl: string };
};

const isLinkKey = (key: string): key is V2PlatformLinkKey => (V2_LINK_KEYS as readonly string[]).includes(key);

// An undeclared key is ignored rather than guessed at.
const toLinks = (links: V2ConfigurationQuery['config']['links']) => {
  const declared: V2PlatformConfig['links'] = {};
  for (const { key, url } of links) {
    if (isLinkKey(key)) {
      declared[key] = url;
    }
  }
  return declared;
};

const decodeFeatures = (features: unknown): Record<string, boolean> =>
  features !== null && typeof features === 'object' && !Array.isArray(features)
    ? Object.fromEntries(
        Object.entries(features).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
      )
    : {};

export const toV2PlatformConfig = ({ config }: V2ConfigurationQuery): V2PlatformConfig => ({
  platformId: config.platformId,
  languages: config.languages,
  defaultLanguage: config.defaultLanguage,
  features: decodeFeatures(config.features),
  iframeAllowlist: config.iframeAllowlist,
  vapidPublicKey: config.vapidPublicKey ?? undefined,
  storage: { maxFileSize: config.storage.maxFileSize, allowedMime: config.storage.allowedMime },
  kratosPublicUrl: config.authentication.kratosPublicUrl,
  links: toLinks(config.links),
  matrix: {
    homeserverUrl: config.matrix.homeserverUrl,
    serverName: config.matrix.serverName,
    sessionBaseUrl: config.matrix.sessionBaseUrl,
  },
});
