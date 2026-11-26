import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { V2ConfigurationDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { useKratosClient } from '@/core/auth/authentication/hooks/useKratosClient';
import { V2ConfigProvider } from '@/domain/platform/config/v2/V2ConfigProvider';
import { V2KratosPublicUrlProvider } from './V2KratosPublicUrlProvider';

const configMock = {
  request: { query: V2ConfigurationDocument },
  result: {
    data: {
      config: {
        __typename: 'Config',
        platformId: '00000000-0000-0000-0000-000000000001',
        languages: ['en'],
        defaultLanguage: 'en',
        authProviders: [],
        features: {},
        authentication: { __typename: 'ConfigAuthentication', kratosPublicUrl: 'https://alkem.io/ory/kratos/public' },
        matrix: { __typename: 'ConfigMatrix', homeserverUrl: 'https://matrix.alkem.io', serverName: 'alkem.io' },
        links: [],
        iframeAllowlist: [],
        geo: null,
        vapidPublicKey: null,
        versions: null,
        storage: { __typename: 'StorageLimits', maxFileSize: 1, allowedMime: [] },
      },
    },
  },
};

describe('V2KratosPublicUrlProvider', () => {
  test('the Kratos client takes its URL from Config.authentication (G11)', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={[configMock]} cache={createV2Cache()}>
        <V2ConfigProvider>
          <V2KratosPublicUrlProvider>{children}</V2KratosPublicUrlProvider>
        </V2ConfigProvider>
      </MockedProvider>
    );
    const { result } = renderHook(() => useKratosClient(), { wrapper });

    await vi.waitFor(() =>
      expect((result.current as unknown as { configuration?: { basePath?: string } })?.configuration?.basePath).toBe(
        'https://alkem.io/ory/kratos/public'
      )
    );
  });
});
