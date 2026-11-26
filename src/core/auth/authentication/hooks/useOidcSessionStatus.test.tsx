import { ApolloError } from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

const { foundation } = vi.hoisted(() => ({
  foundation: {
    data: undefined as
      | {
          viewer: {
            id: string;
            actor: { id: string; actorType: string; url: string | null; about: { displayName: string } | null } | null;
            session: { authenticated: boolean };
          };
        }
      | undefined,
    loading: false,
    error: undefined as Error | undefined,
    refetch: vi.fn(),
  },
}));
vi.mock('@/core/foundation/NativeFoundationProvider', () => ({ useNativeFoundation: () => foundation }));
vi.mock('react-i18next', async importOriginal => ({
  ...(await importOriginal<typeof import('react-i18next')>()),
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

const anonymous = () => ({
  viewer: { id: '00000000-0000-0000-0000-000000000000', actor: null, session: { authenticated: false } },
});
const fetchBoundary = vi.fn<typeof fetch>();
const renderShell = () =>
  render(
    <MemoryRouter initialEntries={['/spaces']}>
      <CrdLayoutWrapper>
        <p>Page content</p>
      </CrdLayoutWrapper>
    </MemoryRouter>
  );

beforeEach(() => {
  foundation.data = anonymous();
  foundation.loading = false;
  foundation.error = undefined;
  foundation.refetch.mockReset().mockResolvedValue(undefined);
  fetchBoundary.mockReset().mockRejectedValue(new Error('The shell must share the foundation result'));
  vi.stubGlobal('fetch', fetchBoundary);
});
afterEach(() => vi.unstubAllGlobals());

describe('the shell consumes the admitted foundation identity once', () => {
  it('shows Login only for an actual anonymous foundation and performs no separate status or Viewer lookup', () => {
    renderShell();
    expect(screen.getByRole('link', { name: 'header.login' })).toHaveAttribute(
      'href',
      '/api/auth/oidc/login?returnTo=%2Fspaces'
    );
    expect(screen.queryByText('header.logout')).not.toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeVisible();
    expect(fetchBoundary).not.toHaveBeenCalled();
  });

  it.each([
    'user',
    'guest',
    'organization',
  ])('uses the actual %s effective actor face with the admitted requester session', async actorType => {
    const actor = {
      id: '7b459b2b-143e-4ac8-994b-16b574aeb844',
      actorType,
      url: '/actors/actual-subject',
      about: { displayName: 'Actual Subject' },
    };
    foundation.data = { viewer: { id: actor.id, actor, session: { authenticated: true } } };
    renderShell();
    expect(screen.queryByRole('link', { name: 'header.login' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'AS' }));
    expect(await screen.findByText('Actual Subject')).toBeVisible();
    expect(screen.getByRole('menuitem', { name: 'header.profile' })).toHaveAttribute('href', actor.url);
    expect(screen.getByRole('menuitem', { name: 'header.logout' })).toBeVisible();
    expect(screen.queryByText('header.myAccount')).not.toBeInTheDocument();
    expect(screen.queryByText('header.administration')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'header.notifications' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'header.messages' })).not.toBeInTheDocument();
    expect(fetchBoundary).not.toHaveBeenCalled();
  });

  it('does not fabricate a profile face or route when disclosure is absent', () => {
    foundation.data = {
      viewer: {
        id: '7b459b2b-143e-4ac8-994b-16b574aeb844',
        actor: { id: '7b459b2b-143e-4ac8-994b-16b574aeb844', actorType: 'guest', url: null, about: null },
        session: { authenticated: true },
      },
    };
    renderShell();
    expect(screen.getByRole('button', { name: 'header.logout' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'header.login' })).not.toBeInTheDocument();
    expect(screen.queryByText('header.profile')).not.toBeInTheDocument();
  });

  it('keeps loading distinct from signed out without blocking the page', () => {
    foundation.data = undefined;
    foundation.loading = true;
    renderShell();
    expect(screen.queryByRole('link', { name: 'header.login' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('loading');
    expect(screen.getByText('Page content')).toBeVisible();
    expect(fetchBoundary).not.toHaveBeenCalled();
  });

  it('enters the retained logout route and consumes the new shared observation after navigation', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    foundation.data = {
      viewer: { id: '7b459b2b-143e-4ac8-994b-16b574aeb844', actor: null, session: { authenticated: true } },
    };
    const page = renderShell();
    fireEvent.click(screen.getByRole('button', { name: 'header.logout' }));
    expect(assign).toHaveBeenCalledExactlyOnceWith('/logout');
    page.unmount();
    foundation.data = anonymous();
    renderShell();
    expect(screen.getByRole('link', { name: 'header.login' })).toBeVisible();
    expect(screen.queryByText('header.logout')).not.toBeInTheDocument();
    expect(fetchBoundary).not.toHaveBeenCalled();
  });

  it('hides stale actor controls on an unavailable observation and retries the shared operation', async () => {
    foundation.data = {
      viewer: {
        id: '7b459b2b-143e-4ac8-994b-16b574aeb844',
        actor: {
          id: '7b459b2b-143e-4ac8-994b-16b574aeb844',
          actorType: 'user',
          url: '/actors/prior',
          about: { displayName: 'Prior Subject' },
        },
        session: { authenticated: true },
      },
    };
    foundation.error = new ApolloError({
      networkError: Object.assign(new Error('Session dependency unavailable'), {
        statusCode: 503,
        result: { error: 'session_store_unavailable' },
      }),
    });
    renderShell();
    expect(screen.getByRole('alert')).toHaveTextContent('apollo.errors.network.session_store_unavailable');
    expect(screen.queryByRole('link', { name: 'header.login' })).not.toBeInTheDocument();
    expect(screen.queryByText('header.logout')).not.toBeInTheDocument();
    expect(foundation.refetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'apollo.errors.network.retry' }));
    await waitFor(() => expect(foundation.refetch).toHaveBeenCalledTimes(1));
    expect(fetchBoundary).not.toHaveBeenCalled();
  });

  it.each([
    [
      'admission401',
      new ApolloError({ networkError: Object.assign(new Error('Admission refused'), { statusCode: 401 }) }),
    ],
    [
      'unsupported selection',
      new ApolloError({ graphQLErrors: [new GraphQLError('Unsupported', { extensions: { code: 'UNAVAILABLE' } })] }),
    ],
    [
      'missing context',
      new ApolloError({ networkError: new Error('The response did not include its admitted authorization context') }),
    ],
  ])('preserves the supplied error surface for %s without inventing a session-store outage', (_name, error) => {
    foundation.error = error;
    renderShell();
    expect(screen.getByText('Page content')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'header.login' })).not.toBeInTheDocument();
    expect(screen.queryByText('header.logout')).not.toBeInTheDocument();
    expect(screen.queryByText('apollo.errors.network.session_store_unavailable')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'apollo.errors.network.retry' })).not.toBeInTheDocument();
    expect(fetchBoundary).not.toHaveBeenCalled();
  });
});
