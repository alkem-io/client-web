import { describe, expect, test } from 'vitest';
import type { V2ConfigurationQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { toV2PlatformConfig } from './v2PlatformConfig';

const config = (features: unknown, links: { key: string; url: string }[] = []): V2ConfigurationQuery => ({
  config: {
    platformId: '00000000-0000-0000-0000-000000000001',
    languages: ['en', 'nl'],
    defaultLanguage: 'en',
    features,
    authentication: { kratosPublicUrl: 'https://alkem.io/ory/kratos/public' },
    matrix: {
      homeserverUrl: 'https://matrix.alkem.io',
      serverName: 'alkem.io',
      sessionBaseUrl: 'https://alkem.io/api/matrix',
    },
    links,
    iframeAllowlist: ['https://www.youtube.com'],
    geo: null,
    vapidPublicKey: null,
    versions: null,
    storage: { maxFileSize: 15728640, allowedMime: ['image/png'] },
  },
});

describe('toV2PlatformConfig', () => {
  test('keeps boolean feature flags by their declared name', () => {
    expect(toV2PlatformConfig(config({ subscriptions: false, 'guidance-engine': true })).features).toEqual({
      subscriptions: false,
      'guidance-engine': true,
    });
  });

  test('drops non-boolean flag values and a non-object payload instead of coercing them', () => {
    expect(toV2PlatformConfig(config({ subscriptions: 'yes', 'landing-page': true })).features).toEqual({
      'landing-page': true,
    });
    expect(toV2PlatformConfig(config(['subscriptions'])).features).toEqual({});
  });

  test('declared link keys map by key; an undeclared key is ignored', () => {
    const { links } = toV2PlatformConfig(
      config({}, [
        { key: 'terms', url: 'https://alkem.io/terms' },
        { key: 'domain', url: 'https://alkem.io' },
        { key: 'blog', url: 'https://alkem.io/blog' },
      ])
    );
    expect(links).toEqual({ terms: 'https://alkem.io/terms', domain: 'https://alkem.io' });
  });

  test('the Kratos public URL comes from Config.authentication (G11)', () => {
    expect(toV2PlatformConfig(config({})).kratosPublicUrl).toBe('https://alkem.io/ory/kratos/public');
    expect(toV2PlatformConfig(config({})).matrix).toEqual({
      homeserverUrl: 'https://matrix.alkem.io',
      serverName: 'alkem.io',
      sessionBaseUrl: 'https://alkem.io/api/matrix',
    });
  });

  test('an absent VAPID key is undefined, not an empty key', () => {
    expect(toV2PlatformConfig(config({})).vapidPublicKey).toBeUndefined();
  });
});
