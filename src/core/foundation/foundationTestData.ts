import type { NativeConfigurationQuery, V2FoundationQuery } from '@/core/apollo/generated-v2/graphql-schema';

export const anonymousContext = {
  requester: '00000000-0000-0000-0000-000000000008',
  effective: '00000000-0000-0000-0000-000000000008',
  anonymous: true,
};
export const foundationTestData = (): V2FoundationQuery & NativeConfigurationQuery => ({
  config: {
    __typename: 'Config',
    platformId: '00000000-0000-0000-0000-000000000001',
    matrix: { __typename: 'ConfigMatrix', sessionBaseUrl: '/api/matrix' },
    languages: ['en', 'nl'],
    defaultLanguage: 'en',
    features: { 'landing-page': false },
    authProviders: [],
    authentication: {
      __typename: 'ConfigAuthentication',
      kratosPublicUrl: 'https://platform.example.test/ory/kratos/public',
    },
    links: [
      { __typename: 'ConfigLink', key: 'domain', url: 'https://platform.example.test' },
      { __typename: 'ConfigLink', key: 'terms', url: 'https://platform.example.test/legal/terms' },
      { __typename: 'ConfigLink', key: 'privacy', url: 'https://platform.example.test/legal/privacy' },
    ],
    iframeAllowlist: [],
    telemetry: null,
    geo: null,
    versions: null,
  },
  viewer: {
    __typename: 'Viewer',
    matrix: null,
    id: '00000000-0000-0000-0000-000000000000',
    actor: null,
    session: { __typename: 'SessionInfo', authenticated: false, issuedAt: null, fresh: false, authMethods: [] },
    language: null,
    homeSpace: null,
    account: null,
    platformRoles: [],
    platformPrivileges: [],
  },
  resolve: { __typename: 'ResolveResult', homepage: null },
});

export const memberContext = {
  requester: '00000000-0000-0000-0000-000000000051',
  effective: '00000000-0000-0000-0000-000000000051',
  anonymous: false,
};

export const memberFoundationTestData = (): V2FoundationQuery & NativeConfigurationQuery => ({
  ...foundationTestData(),
  viewer: {
    __typename: 'Viewer',
    matrix: null,
    id: memberContext.effective,
    actor: {
      __typename: 'User',
      id: memberContext.effective,
      actorType: 'user',
      url: '/member',
      about: { __typename: 'About', displayName: 'Current member', tagline: 'Own profile' },
      settings: {
        home_space: { id: '00000000-0000-0000-0000-000000000052', auto_redirect: true },
        notification_sounds: { chat_message: false, in_app: true },
      },
      notificationPrefs: null,
    },
    session: {
      __typename: 'SessionInfo',
      authenticated: true,
      issuedAt: '2026-11-18T09:00:00Z',
      fresh: true,
      authMethods: ['pwd'],
    },
    language: 'nl',
    homeSpace: { __typename: 'Space', id: '00000000-0000-0000-0000-000000000052', url: '/own-space' },
    account: {
      __typename: 'AccountSummary',
      id: '00000000-0000-0000-0000-000000000053',
      canCreate: [{ __typename: 'CanCreate', kind: 'space', allowed: true, reason: null }],
      entitlements: [{ __typename: 'Entitlement', name: 'account-space-free', limit: 1, usage: 0 }],
    },
    platformRoles: [],
    platformPrivileges: [],
  },
});
