/** @vitest-environment jsdom */
import { InMemoryCache } from '@apollo/client';
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import type { FC, PropsWithChildren } from 'react';
import { describe, expect, it } from 'vitest';
import { useVerifyMemoSignatureLazyQuery, VerifyMemoSignatureDocument } from '@/core/apollo/generated/apollo-hooks';
import { MemoSignatureVerificationStatus, type VerifyMemoSignatureQuery } from '@/core/apollo/generated/graphql-schema';

describe('Memo signature verification cache policy', () => {
  it('does not retain the integrity result in Apollo cache', async () => {
    const cache = new InMemoryCache();
    const variables = { attemptID: '00000000-0000-4000-8000-000000000001' };
    const mocks: MockedResponse<VerifyMemoSignatureQuery>[] = [
      {
        request: { query: VerifyMemoSignatureDocument, variables },
        result: {
          data: {
            verifyMemoSignature: MemoSignatureVerificationStatus.Verified,
          },
        },
      },
    ];
    const wrapper: FC<PropsWithChildren> = ({ children }) => (
      <MockedProvider mocks={mocks} cache={cache}>
        {children}
      </MockedProvider>
    );
    const { result } = renderHook(() => useVerifyMemoSignatureLazyQuery({ fetchPolicy: 'no-cache' }), { wrapper });

    await act(async () => {
      const response = await result.current[0]({
        variables,
      });
      expect(response.data?.verifyMemoSignature).toBe(MemoSignatureVerificationStatus.Verified);
    });

    expect(JSON.stringify(cache.extract())).not.toContain('verifyMemoSignature');
  });
});
