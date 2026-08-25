import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistrationCrdRoute, SignUpCrdRoute } from './SignUpCrdRoute';

// Shared, hoisted holder so the (hoisted) vi.mock factories can expose state we
// control per-test: the guest-session hook return, the props the page passes
// to GuestReturnNotice, the mocked Kratos flow, and the props passed to SignUpCard.
const h = vi.hoisted(() => ({
  guest: {
    shouldShowNotification: false,
    whiteboardUrl: null as string | null,
    handleBackToWhiteboard: vi.fn(),
    handleGoToWebsite: vi.fn(),
    clearSession: vi.fn(),
  },
  noticeProps: undefined as undefined | { onBackToWhiteboard: () => void; onGoToWebsite: () => void },
  flow: undefined as undefined | { id: string; active?: string; ui: { nodes: unknown[]; messages: unknown[] } },
  signUpCardProps: undefined as
    | undefined
    | {
        hasAcceptedTerms: boolean;
        onAcceptedTermsChange: (v: boolean) => void;
        showSignpost?: boolean;
        onProviderClick?: (providerKey: string) => void;
      },
}));

// The unit under test is the conditional wiring — stub the heavy children with
// sentinels so we assert presence/handlers without the full Kratos / CRD stack.
vi.mock('@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSessionReturn', () => ({
  useGuestSessionReturn: () => h.guest,
}));
vi.mock('@/crd/components/auth/GuestReturnNotice', () => ({
  GuestReturnNotice: (props: { onBackToWhiteboard: () => void; onGoToWebsite: () => void }) => {
    h.noticeProps = props;
    return <div data-testid="guest-return-notice" />;
  },
}));
vi.mock('@/crd/components/auth/SignUpCard', () => ({
  SignUpCard: (props: {
    hasAcceptedTerms: boolean;
    onAcceptedTermsChange: (v: boolean) => void;
    showSignpost?: boolean;
    onProviderClick?: (providerKey: string) => void;
  }) => {
    h.signUpCardProps = props;
    return (
      <div data-testid="crd-signup-card">
        <input
          type="checkbox"
          aria-label="accept-terms"
          checked={props.hasAcceptedTerms}
          onChange={event => props.onAcceptedTermsChange(event.target.checked)}
        />
        <button type="button" aria-label="provider-button" onClick={() => props.onProviderClick?.('cleverbase')} />
      </div>
    );
  },
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
vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: false }),
}));
vi.mock('@/core/auth/authentication/utils/useSignUpReturnUrl', () => ({
  useReturnUrl: () => ({ setReturnUrl: vi.fn() }),
  useSignUpRoundTrip: () => ({ armed: false, arm: vi.fn(), clearArmed: vi.fn() }),
}));
vi.mock('@/core/analytics/SentryTransactionScopeContext', () => ({ useTransactionScope: () => {} }));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
vi.mock('@/core/routing/useQueryParams', () => ({ useQueryParams: () => new URLSearchParams('') }));
vi.mock('./useKratosMessageCopy', () => ({ useTranslateDescriptor: () => (d: unknown) => d }));
vi.mock('./flowDescriptorAdapter', () => ({ flowDescriptorAdapter: () => ({}) }));
vi.mock('./passkeyTrigger', () => ({ invokePasskeyTrigger: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <SignUpCrdRoute />
    </MemoryRouter>
  );

describe('SignUpCrdRoute — guest return notice wiring', () => {
  beforeEach(() => {
    h.guest.shouldShowNotification = false;
    h.guest.whiteboardUrl = null;
    h.guest.handleBackToWhiteboard.mockReset();
    h.guest.handleGoToWebsite.mockReset();
    h.guest.clearSession.mockReset();
    h.noticeProps = undefined;
    h.flow = undefined;
    h.signUpCardProps = undefined;
    sessionStorage.clear();
  });

  it('[US1] renders the notice above the sign-up form when a guest session is active (FR-001)', () => {
    h.guest.shouldShowNotification = true;
    h.guest.whiteboardUrl = '/public/whiteboard/wb-1';

    renderRoute();

    expect(screen.getByTestId('guest-return-notice')).toBeInTheDocument();
    expect(screen.getByTestId('crd-signup-card')).toBeInTheDocument();
  });

  it('[US1] does not render the notice when there is no active guest session; form unchanged (FR-008)', () => {
    h.guest.shouldShowNotification = false;

    renderRoute();

    expect(screen.queryByTestId('guest-return-notice')).not.toBeInTheDocument();
    expect(screen.getByTestId('crd-signup-card')).toBeInTheDocument();
  });

  it("[US2] passes the hook's back-to-whiteboard handler through to the notice (FR-003)", () => {
    h.guest.shouldShowNotification = true;

    renderRoute();

    h.noticeProps?.onBackToWhiteboard();
    expect(h.guest.handleBackToWhiteboard).toHaveBeenCalledTimes(1);
  });

  it("[US3] passes the hook's go-to-website handler through to the notice (FR-004)", () => {
    h.guest.shouldShowNotification = true;

    renderRoute();

    h.noticeProps?.onGoToWebsite();
    expect(h.guest.handleGoToWebsite).toHaveBeenCalledTimes(1);
  });

  it('[US4/FR-006] the page never clears the guest session itself', () => {
    h.guest.shouldShowNotification = true;

    renderRoute();
    h.noticeProps?.onBackToWhiteboard();
    h.noticeProps?.onGoToWebsite();

    // Neither rendering nor acting on the notice may end the session — only
    // successful auth (existing clearAllGuestSessionData) does.
    expect(h.guest.clearSession).not.toHaveBeenCalled();
  });
});

// Regression: incidental-defect-signup-terms-checkbox — `/sign_up` and
// `/registration` can resolve to the same Kratos flow id, so the second step
// re-hydrates `accepted` as `true` from the shared sessionStorage key. Before
// the fix, a stray click on the already-checked box on `/registration` simply
// toggled it back to `false` (plain checkbox semantics), silently disabling
// submit. These specs prove that once a mount hydrates as already-accepted,
// further toggling is a no-op, while a fresh/unaccepted mount stays a fully
// interactive checkbox.
describe('SignUpCrdRoute / RegistrationCrdRoute — accept-terms persistence across the shared flow id', () => {
  const storageKeyFor = (flowId: string) => `crd-auth-accepted-terms-${flowId}`;

  beforeEach(() => {
    h.guest.shouldShowNotification = false;
    h.guest.whiteboardUrl = null;
    h.noticeProps = undefined;
    h.signUpCardProps = undefined;
    sessionStorage.clear();
  });

  const renderSignUp = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <SignUpCrdRoute />
      </MemoryRouter>
    );

  const renderRegistration = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <RegistrationCrdRoute />
      </MemoryRouter>
    );

  it('[/sign_up] a fresh checkbox is fully interactive: ticking then re-ticking toggles normally', () => {
    h.flow = { id: 'flow-1', ui: { nodes: [], messages: [] } };

    renderSignUp();
    const checkbox = screen.getByLabelText('accept-terms');

    fireEvent.click(checkbox); // check
    expect(h.signUpCardProps?.hasAcceptedTerms).toBe(true);
    expect(sessionStorage.getItem(storageKeyFor('flow-1'))).toBe('true');

    fireEvent.click(checkbox); // un-check — a real, first-time toggle is never locked
    expect(h.signUpCardProps?.hasAcceptedTerms).toBe(false);
    expect(sessionStorage.getItem(storageKeyFor('flow-1'))).toBe('false');
  });

  it('[/registration, already accepted] re-ticking the pre-checked box is a no-op, not an uncheck', () => {
    // Simulate the carry-over from `/sign_up`: same flow id, already accepted.
    sessionStorage.setItem(storageKeyFor('flow-1'), 'true');
    h.flow = { id: 'flow-1', ui: { nodes: [], messages: [] } };

    renderRegistration();
    const checkbox = screen.getByLabelText('accept-terms') as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
    expect(h.signUpCardProps?.hasAcceptedTerms).toBe(true);

    fireEvent.click(checkbox); // the reported "re-tick" — must be a no-op

    expect(h.signUpCardProps?.hasAcceptedTerms).toBe(true);
    expect(sessionStorage.getItem(storageKeyFor('flow-1'))).toBe('true');
  });

  it('[/registration, not yet accepted] reached directly (no prior acceptance) stays fully interactive', () => {
    h.flow = { id: 'flow-2', ui: { nodes: [], messages: [] } };

    renderRegistration();
    const checkbox = screen.getByLabelText('accept-terms') as HTMLInputElement;

    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox); // first-time acceptance on this very step must work
    expect(h.signUpCardProps?.hasAcceptedTerms).toBe(true);
    expect(sessionStorage.getItem(storageKeyFor('flow-2'))).toBe('true');

    fireEvent.click(checkbox); // and can still be un-checked before it was ever hydrated as true
    expect(h.signUpCardProps?.hasAcceptedTerms).toBe(false);
  });
});

// US4 — the sign-up signpost (FR-013/FR-014): a person who presses a
// provider button while Kratos does not yet recognise their identity lands
// on this same registration flow. The signpost warns them they may already
// have an account, instead of letting them silently create a second one.
describe('SignUpCrdRoute — provider-arrival signpost (FR-013/FR-014)', () => {
  beforeEach(() => {
    h.guest.shouldShowNotification = false;
    h.guest.whiteboardUrl = null;
    h.noticeProps = undefined;
    h.flow = undefined;
    h.signUpCardProps = undefined;
    sessionStorage.clear();
  });

  it('[US4/AS1] renders the signpost when the flow evidences an OIDC continuation (active === "oidc")', () => {
    h.flow = { id: 'flow-oidc', active: 'oidc', ui: { nodes: [], messages: [] } };

    renderRoute();

    expect(h.signUpCardProps?.showSignpost).toBe(true);
  });

  it('[US4/AS2] does not render the signpost for a plain registration flow (no active method)', () => {
    // Realistic direct-registration node shape: a fresh browser registration
    // flow carries default-group trait inputs plus the oidc-group *submit*
    // buttons (which the guard's `!isSubmitButton(node)` must exclude) — not
    // an empty node list, which every flow shape trivially satisfies and so
    // exercises nothing about the guard.
    h.flow = {
      id: 'flow-plain',
      ui: {
        nodes: [
          { group: 'default', attributes: { node_type: 'input', type: 'hidden', name: 'csrf_token' } },
          { group: 'default', attributes: { node_type: 'input', type: 'email', name: 'traits.email' } },
          { group: 'oidc', attributes: { node_type: 'input', type: 'submit', name: 'provider', value: 'github' } },
        ],
        messages: [],
      },
    };

    renderRoute();

    expect(h.signUpCardProps?.showSignpost).toBe(false);
  });

  it('[US4] falls back to detecting an oidc-group non-submit node when `active` is unset (contract fallback evidence)', () => {
    h.flow = {
      id: 'flow-oidc-fallback',
      ui: {
        nodes: [{ group: 'oidc', attributes: { node_type: 'input', type: 'text', name: 'traits.email' } }],
        messages: [],
      },
    };

    renderRoute();

    expect(h.signUpCardProps?.showSignpost).toBe(true);
  });

  it('[US4/FR-014] pressing a provider button on the sign-up screen marks the sessionStorage origin marker with the loaded flow id', () => {
    h.flow = { id: 'flow-plain', ui: { nodes: [], messages: [] } };

    renderRoute();
    h.signUpCardProps?.onProviderClick?.('cleverbase');

    expect(sessionStorage.getItem('alkemio.signupProviderClickOrigin')).toBe('flow-plain');
  });

  it('[US4/FR-014] suppresses the signpost on the returning OIDC-continuation render when the marker matches the loaded flow id', () => {
    sessionStorage.setItem('alkemio.signupProviderClickOrigin', 'flow-oidc');
    h.flow = { id: 'flow-oidc', active: 'oidc', ui: { nodes: [], messages: [] } };

    renderRoute();

    expect(h.signUpCardProps?.showSignpost).toBe(false);
  });

  // corr-client-web-signpost-2: the marker read must be a pure, idempotent
  // render-phase computation (never a read-and-clear), so it survives a
  // discarded-then-retried render (the real-world trigger is the `crd-auth`
  // i18n Suspense retry — see SignUpCrdRoute.suspense.test.tsx for that exact
  // repro). Proven here at the unit level: rendering twice against the same
  // committed marker/flow pair must suppress the signpost both times, and the
  // marker must still be present in storage after the render (not consumed).
  it('[US4/FR-014] the marker read is idempotent: repeated renders of the same continuation flow all suppress the signpost, and the marker is not cleared by rendering alone', () => {
    sessionStorage.setItem('alkemio.signupProviderClickOrigin', 'flow-oidc');
    h.flow = { id: 'flow-oidc', active: 'oidc', ui: { nodes: [], messages: [] } };

    renderRoute();
    const firstRenderShowSignpost = h.signUpCardProps?.showSignpost;
    expect(firstRenderShowSignpost).toBe(false);
    expect(sessionStorage.getItem('alkemio.signupProviderClickOrigin')).toBe('flow-oidc');

    // A second, independent render of the very same continuation (e.g. a page
    // reload, or a validation-error bounce back to the same flow id) — the
    // marker must still match and still suppress.
    renderRoute();
    const secondRenderShowSignpost = h.signUpCardProps?.showSignpost;
    expect(secondRenderShowSignpost).toBe(false);
  });

  // corr-client-web-signpost-3: the marker is scoped to the exact flow id it
  // was set for, not a global one-shot sentinel — a marker left over from an
  // earlier, abandoned provider click must never suppress the signpost for a
  // *different* OIDC continuation (e.g. a genuine login-screen bounce).
  it('[US4/FR-013] a stale marker from a different, earlier flow does not suppress a login-screen bounce on a new flow', () => {
    sessionStorage.setItem('alkemio.signupProviderClickOrigin', 'flow-abandoned');
    h.flow = { id: 'flow-oidc', active: 'oidc', ui: { nodes: [], messages: [] } };

    renderRoute();

    expect(h.signUpCardProps?.showSignpost).toBe(true);
  });

  it('[US4/FR-013] a login-screen provider bounce (no sign-up-origin marker) still shows the signpost', () => {
    h.flow = { id: 'flow-oidc', active: 'oidc', ui: { nodes: [], messages: [] } };

    renderRoute();

    expect(h.signUpCardProps?.showSignpost).toBe(true);
  });

  it('clears a stale marker once the loaded flow resolves as a plain (non-OIDC) registration, via a commit-phase effect', async () => {
    sessionStorage.setItem('alkemio.signupProviderClickOrigin', 'flow-old');
    h.flow = { id: 'flow-fresh', ui: { nodes: [], messages: [] } };

    renderRoute();

    // The effect runs after commit (act() flushes it synchronously here).
    expect(sessionStorage.getItem('alkemio.signupProviderClickOrigin')).toBeNull();
  });

  it('the existing 4000007 (account-already-exists) redirect still wins precedence over the signpost', () => {
    h.flow = {
      id: 'flow-exists',
      active: 'oidc',
      ui: { nodes: [], messages: [{ id: 4000007, text: 'account exists', type: 'error' }] },
    };

    renderRoute();

    // The account-exists branch redirects to login before SignUpCard ever mounts.
    expect(screen.queryByTestId('crd-signup-card')).not.toBeInTheDocument();
  });
});
