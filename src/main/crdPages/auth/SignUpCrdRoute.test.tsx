import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignUpCrdRoute } from './SignUpCrdRoute';

// Shared, hoisted holder so the (hoisted) vi.mock factories can expose state we
// control per-test: the guest-session hook return and the props the page passes
// to GuestReturnNotice.
const h = vi.hoisted(() => ({
  guest: {
    shouldShowNotification: false,
    whiteboardUrl: null as string | null,
    handleBackToWhiteboard: vi.fn(),
    handleGoToWebsite: vi.fn(),
    clearSession: vi.fn(),
  },
  noticeProps: undefined as undefined | { onBackToWhiteboard: () => void; onGoToWebsite: () => void },
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
  SignUpCard: () => <div data-testid="crd-signup-card" />,
}));
vi.mock('./AuthShellWrapper', () => ({
  AuthShellWrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('@/main/routing/urlBuilders', () => ({ buildLoginUrl: () => '/login' }));
vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ locations: { terms: '#', privacy: '#' } }),
}));
vi.mock('@/core/auth/authentication/hooks/useKratosFlow', () => ({
  default: () => ({ flow: undefined, loading: false }),
  FlowTypeName: { Registration: 'Registration' },
}));
vi.mock('@/core/auth/authentication/hooks/usePasskeyScript', () => ({ default: () => ({}) }));
vi.mock('@/core/auth/authentication/utils/useSignUpReturnUrl', () => ({
  useReturnUrl: () => ({ setReturnUrl: vi.fn() }),
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
