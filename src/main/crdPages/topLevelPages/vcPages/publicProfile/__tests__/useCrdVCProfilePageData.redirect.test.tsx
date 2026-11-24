import { ApolloError } from '@apollo/client';
import { render } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { Component, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotAuthorizedError } from '@/core/40XErrorHandler/40XErrors';

const vcProfileQuery = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useVirtualContributorProfileWithModelCardQuery: () => vcProfileQuery(),
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery: () => ({ data: undefined, loading: false }),
  useSpaceBodyOfKnowledgeAboutQuery: () => ({ data: undefined, loading: false }),
}));
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ loading: false }),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ isAuthenticated: true }),
}));
vi.mock('@/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase', () => ({
  default: () => ({ knowledgeBaseDescription: undefined, hasReadAccess: false, loading: false }),
}));
vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({ vcId: 'vc-1', loading: false }),
}));

import { useCrdVCProfilePageData } from '../useCrdVCProfilePageData';

const failedWith = (code: string) =>
  new ApolloError({ graphQLErrors: [new GraphQLError('not available', { extensions: { code } })] });

class CatchRedirect extends Component<{ onError: (error: unknown) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Renders the page data with the real restricted redirect, recording what each render would show. */
const renderPageData = () => {
  const shownNotFound: boolean[] = [];
  let redirected: unknown;
  const Probe = () => {
    shownNotFound.push(useCrdVCProfilePageData().isNotFoundError);
    return null;
  };
  render(
    <MemoryRouter>
      <CatchRedirect onError={error => (redirected = error)}>
        <Probe />
      </CatchRedirect>
    </MemoryRouter>
  );
  return { shownNotFound, redirected };
};

describe('useCrdVCProfilePageData — one outcome for a profile that cannot be shown', () => {
  beforeEach(() => {
    vcProfileQuery.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('sends a profile that is not available to the restricted page, without first showing it as not found', () => {
    vcProfileQuery.mockReturnValue({ data: undefined, loading: false, error: failedWith('FORBIDDEN_POLICY') });

    const { shownNotFound, redirected } = renderPageData();

    expect(redirected).toBeInstanceOf(NotAuthorizedError);
    expect(shownNotFound).not.toContain(true);
  });

  it('shows a profile reported missing as not found, without redirecting', () => {
    vcProfileQuery.mockReturnValue({ data: undefined, loading: false, error: failedWith('ENTITY_NOT_FOUND') });

    const { shownNotFound, redirected } = renderPageData();

    expect(redirected).toBeUndefined();
    expect(shownNotFound).toContain(true);
  });
});
