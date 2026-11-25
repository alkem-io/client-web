import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Cookies, CookiesProvider } from 'react-cookie';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const { passThrough } = vi.hoisted(() => ({ passThrough: ({ children }: { children: ReactNode }) => children }));

vi.mock('react-router-dom', () => ({ Outlet: () => null }));
vi.mock('@/core/analytics/SentryTransactionScopeContext', () => ({ useUserScope: () => {} }));
vi.mock('@/core/ui/notifications/CrdNotificationHandler', () => ({ CrdNotificationHandler: () => null }));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: undefined }),
}));
vi.mock('@/domain/language/LanguageOfferContext', () => ({ LanguageOfferProvider: passThrough }));
vi.mock('@/domain/platform/config/useConfig', () => ({ useConfig: () => ({ serverMetadata: { services: [] } }) }));
vi.mock('@/main/cookies/CrdCookieConsent', () => ({ default: () => <div>cookie banner</div> }));

const renderApp = (consentCookie?: string) => {
  if (consentCookie !== undefined) new Cookies().set('accepted_cookies', consentCookie, { path: '/' });
  render(
    <CookiesProvider>
      <App />
    </CookiesProvider>
  );
};

afterEach(() => {
  cleanup();
  new Cookies().remove('accepted_cookies', { path: '/' });
});

describe('App cookie banner', () => {
  it('shows the banner when no choice is stored', async () => {
    renderApp();

    expect(await screen.findByText('cookie banner')).toBeTruthy();
  });

  it('shows the banner again for a malformed consent cookie', async () => {
    renderApp('not-a-list');

    expect(await screen.findByText('cookie banner')).toBeTruthy();
  });

  it('hides the banner once a choice is stored', async () => {
    renderApp('["technical"]');

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(screen.queryByText('cookie banner')).toBeNull();
  });
});
