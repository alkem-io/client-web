/**
 * corr-client-web-signpost-2 — real Suspense repro.
 *
 * `crd-auth` is a lazy i18n namespace (see `src/core/i18n/config.ts`): it is
 * not in the eagerly-loaded `ns`/`resources`, so `SignUpCard`'s
 * `useTranslation('crd-auth')` throws a promise on its first render under a
 * real `I18nextProvider`. React discards whatever render was in flight and
 * retries once the namespace resolves, exactly as it does in production
 * behind the `<Suspense fallback={null}>` boundary in `IdentityRoute.tsx`.
 *
 * A render-phase read-and-clear of the sign-up-origin marker (the round-1
 * shape of the FR-014 fix) is silently undone by that discard: the marker
 * gets consumed on the throwaway render and is gone by the time the render
 * that actually commits runs, so the signpost fires anyway. This file uses
 * the real `i18n` singleton and the real (unmocked) `SignUpCard` — unlike
 * `SignUpCrdRoute.test.tsx`, which mocks both away and so cannot see this
 * class of defect — to prove the fix (a pure, idempotent render-phase read)
 * survives the retry.
 */
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { SignUpCrdRoute } from './SignUpCrdRoute';

const h = vi.hoisted(() => ({
  flow: undefined as undefined | { id: string; active?: string; ui: { nodes: unknown[]; messages: unknown[] } },
}));

// Everything except react-i18next / SignUpCard is stubbed — same substitutions
// as SignUpCrdRoute.test.tsx — so the only thing exercised here is the real
// i18n Suspense path through the real SignUpCard.
vi.mock('@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSessionReturn', () => ({
  useGuestSessionReturn: () => ({
    shouldShowNotification: false,
    handleBackToWhiteboard: vi.fn(),
    handleGoToWebsite: vi.fn(),
  }),
}));
vi.mock('./AuthShellWrapper', () => ({
  AuthShellWrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('@/main/routing/urlBuilders', () => ({ buildLoginUrl: () => '/login' }));
vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ locations: { terms: '#', privacy: '#' } }),
}));
vi.mock('@/core/auth/authentication/hooks/useKratosFlow', () => ({
  default: () => ({ flow: h.flow, loading: false }),
  FlowTypeName: { Registration: 'Registration' },
}));
vi.mock('@/core/auth/authentication/hooks/usePasskeyScript', () => ({ default: () => ({}) }));
vi.mock('@/core/auth/authentication/utils/useSignUpReturnUrl', () => ({
  useReturnUrl: () => ({ setReturnUrl: vi.fn() }),
  useSignUpRoundTrip: () => ({ armed: false, arm: vi.fn(), clearArmed: vi.fn() }),
}));
vi.mock('@/core/analytics/SentryTransactionScopeContext', () => ({ useTransactionScope: () => {} }));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
vi.mock('@/core/routing/useQueryParams', () => ({ useQueryParams: () => new URLSearchParams('') }));
vi.mock('./useKratosMessageCopy', () => ({ useTranslateDescriptor: () => (d: unknown) => d }));
vi.mock('./flowDescriptorAdapter', () => ({
  flowDescriptorAdapter: () => ({
    flowType: 'registration',
    action: '#',
    method: 'POST',
    messages: [],
    groups: { hidden: [], default: [], password: [], rest: [], submit: [], oidc: [], passkey: [], anchors: [] },
  }),
}));
vi.mock('./passkeyTrigger', () => ({ invokePasskeyTrigger: vi.fn() }));

const renderRoute = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={['/']}>
        {/* Matches the real Suspense boundary IdentityRoute.tsx wraps this route in. */}
        <Suspense fallback={null}>
          <SignUpCrdRoute />
        </Suspense>
      </MemoryRouter>
    </I18nextProvider>
  );

describe('SignUpCrdRoute — real i18n Suspense retry (corr-client-web-signpost-2 repro)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    h.flow = undefined;
  });

  it('still suppresses the signpost on the render that actually commits, after crd-auth suspends and React retries', async () => {
    sessionStorage.setItem('alkemio.signupProviderClickOrigin', 'flow-oidc');
    h.flow = { id: 'flow-oidc', active: 'oidc', ui: { nodes: [], messages: [] } };

    renderRoute();

    // Wait for the post-suspense, committed render (the real SignUpCard's
    // heading only appears once the crd-auth namespace has resolved).
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());

    expect(screen.queryByTestId('signup-signpost')).not.toBeInTheDocument();
  });

  it('still shows the signpost after the retry when there is no matching origin marker (FR-013 case unaffected)', async () => {
    h.flow = { id: 'flow-oidc', active: 'oidc', ui: { nodes: [], messages: [] } };

    renderRoute();

    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());

    expect(screen.getByTestId('signup-signpost')).toBeInTheDocument();
  });
});
