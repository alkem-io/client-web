import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const vcProfileQuery = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVirtualContributorProfileWithModelCardQuery: () => vcProfileQuery(),
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery: () => ({ data: undefined, loading: false }),
  useSpaceBodyOfKnowledgeAboutQuery: () => ({ data: undefined, loading: false }),
}));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ loading: false }),
}));
vi.mock('@/core/routing/useRestrictedRedirect', () => ({ default: () => undefined }));
vi.mock('@/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase', () => ({
  default: () => ({ knowledgeBaseDescription: undefined, hasReadAccess: false, loading: false }),
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ vcId: 'vc-1', loading: false }),
}));

import { useCrdVCProfilePageData } from '../useCrdVCProfilePageData';

const failedWith = (code: string) =>
  new ApolloError({ graphQLErrors: [new GraphQLError('not available', { extensions: { code } })] });

describe('useCrdVCProfilePageData — not-available state', () => {
  beforeEach(() => {
    vcProfileQuery.mockReset();
  });

  it('shows the not-found view for ENTITY_NOT_FOUND', () => {
    vcProfileQuery.mockReturnValue({ data: undefined, loading: false, error: failedWith('ENTITY_NOT_FOUND') });

    const { result } = renderHook(() => useCrdVCProfilePageData());

    expect(result.current.isNotFoundError).toBe(true);
  });

  it.each(['FORBIDDEN_POLICY', 'UNSPECIFIED'])('does not for %s', code => {
    vcProfileQuery.mockReturnValue({ data: undefined, loading: false, error: failedWith(code) });

    const { result } = renderHook(() => useCrdVCProfilePageData());

    expect(result.current.isNotFoundError).toBe(false);
  });
});
