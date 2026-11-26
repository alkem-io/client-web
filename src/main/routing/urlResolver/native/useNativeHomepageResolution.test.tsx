import { MockedProvider } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { V2ResolveDocument } from '@/core/apollo/generated-v2/apollo-hooks';
import { useNativeHomepageResolution } from './useNativeHomepageResolution';

describe('native host homepage carrier', () => {
  it.each([
    null,
    { __typename: 'Space', id: 'configured-homepage' },
  ])('uses only the returned homepage and never guesses one from node or the URL', async homepage => {
    const { result } = renderHook(useNativeHomepageResolution, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MockedProvider
          mocks={[
            {
              request: { query: V2ResolveDocument, variables: { url: new URL('/', window.location.origin).href } },
              result: {
                data: {
                  resolve: {
                    __typename: 'ResolveResult',
                    state: 'OK',
                    matchedPrefix: null,
                    remainder: [],
                    node: {
                      __typename: 'Space',
                      id: 'different-node',
                      entityType: 'space',
                      spaceUrl: '/different-node',
                    },
                    ancestors: [],
                    closestReadable: null,
                    space: null,
                    homepage,
                  },
                },
              },
            },
          ]}
        >
          {children}
        </MockedProvider>
      ),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeUndefined();
    expect(result.current.homepageId).toBe(homepage?.id);
    expect(result.current.homepage).toEqual(homepage ?? undefined);
  });
});
