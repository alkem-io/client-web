import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, test } from 'vitest';
import { KratosPublicUrlContext } from './KratosPublicUrlContext';
import { useKratosClient } from './useKratosClient';

const configuredBasePath = (client: unknown) =>
  (client as { configuration?: { basePath?: string } }).configuration?.basePath;

describe('useKratosClient', () => {
  test('a supplied Kratos public URL is used without the legacy platform configuration', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <KratosPublicUrlContext.Provider value="https://identity.example/ory/kratos/public">
        {children}
      </KratosPublicUrlContext.Provider>
    );
    const { result } = renderHook(() => useKratosClient(), { wrapper });

    expect(configuredBasePath(result.current)).toBe('https://identity.example/ory/kratos/public');
  });

  test('without a supplied URL or a legacy configuration there is no client', () => {
    const { result } = renderHook(() => useKratosClient());

    expect(result.current).toBeUndefined();
  });
});
