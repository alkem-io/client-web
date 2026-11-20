import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authenticatorOnlySettingsFlow,
  enrolledSecondFactorSettingsFlow,
  notEnrolledSettingsFlow,
} from './__fixtures__/secondFactorFlows';
import { SecondFactorCrdRoute } from './SecondFactorCrdRoute';

let mockSearch = '';
let mockFlow: unknown;
let mockAppMode = false;
const useKratosFlowSpy = vi.fn();
const usePasskeyScriptSpy = vi.fn();

vi.mock('@/core/routing/useQueryParams', () => ({ useQueryParams: () => new URLSearchParams(mockSearch) }));
vi.mock('@/domain/platform/routes/usePlatformOrigin', () => ({ default: () => 'https://alkem.io' }));
vi.mock('@/core/appMode/isAppMode', () => ({ isAppMode: () => mockAppMode }));
vi.mock('@/core/auth/authentication/hooks/useKratosFlow', () => ({
  default: (...args: unknown[]) => {
    useKratosFlowSpy(...args);
    return { flow: mockFlow, loading: false, error: undefined, refetch: vi.fn() };
  },
  FlowTypeName: { Settings: 'Settings' },
}));
vi.mock('@/core/auth/authentication/hooks/usePasskeyScript', () => ({
  default: (nodes: unknown) => usePasskeyScriptSpy(nodes),
}));
vi.mock('./AuthShellWrapper', () => ({
  AuthShellWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/core/analytics/SentryTransactionScopeContext', () => ({ useTransactionScope: () => {} }));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

// No Apollo provider anywhere in this render: the page must issue no GraphQL.
const renderRoute = () =>
  render(
    <MemoryRouter>
      <SecondFactorCrdRoute />
    </MemoryRouter>
  );

describe('SecondFactorCrdRoute', () => {
  beforeEach(() => {
    mockSearch = '';
    mockFlow = notEnrolledSettingsFlow;
    mockAppMode = false;
    useKratosFlowSpy.mockClear();
    usePasskeyScriptSpy.mockClear();
  });

  it('creates a settings flow returning to the page on the platform origin, and offers enrolment', () => {
    renderRoute();

    expect(useKratosFlowSpy).toHaveBeenCalledWith('Settings', undefined, {
      returnTo: 'https://alkem.io/second-factor',
    });
    expect(screen.getByText('secondFactorPage.required')).toBeInTheDocument();
    expect(screen.getByText('user.security.twoStep.authenticator.setUp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.add' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'secondFactorPage.signOut' })).toHaveAttribute('href', '/logout');
  });

  it('resumes the flow named by ?flow= instead of creating one', () => {
    mockSearch = 'flow=settings-1';

    renderRoute();

    expect(useKratosFlowSpy).toHaveBeenCalledWith('Settings', 'settings-1', expect.anything());
  });

  it("hands the flow's nodes to the Ory script hook", () => {
    renderRoute();

    expect(usePasskeyScriptSpy).toHaveBeenCalledWith(notEnrolledSettingsFlow.ui.nodes);
  });

  // Signing in again must first end the identity-provider session (a sign-in that rode it would
  // complete with no prompt and never ask for the second step), then land on the sign-in; signing out
  // lands wherever a plain logout does.
  it('once a factor is enrolled, says to sign in again, through the logout that ends the session on the sign-in', () => {
    mockFlow = enrolledSecondFactorSettingsFlow;

    renderRoute();

    expect(screen.getByText('secondFactorPage.enrolled')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'secondFactorPage.signInAgain' })).toHaveAttribute(
      'href',
      '/logout?signInAgain=true'
    );
    expect(screen.getByRole('link', { name: 'secondFactorPage.signOut' })).toHaveAttribute('href', '/logout');
    expect(screen.queryByText('user.security.twoStep.authenticator.setUp')).not.toBeInTheDocument();
  });

  // A single way is not enough, whatever this sign-in used: the page says so, keeps the settings in
  // reach to add another, and still offers signing in again for after that.
  it('with a single way to pass the second step, says a second one is needed and keeps the settings in reach', () => {
    mockFlow = authenticatorOnlySettingsFlow;

    renderRoute();

    expect(screen.getByText('secondFactorPage.secondWay')).toBeInTheDocument();
    expect(screen.queryByText('secondFactorPage.enrolled')).not.toBeInTheDocument();
    expect(screen.getByText('user.security.twoStep.authenticator.active')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'user.security.twoStep.securityKeys.add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'user.security.twoStep.recoveryCodes.generate' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'secondFactorPage.signInAgain' })).toHaveAttribute(
      'href',
      '/logout?signInAgain=true'
    );
    // The page speaks for itself: the section repeats none of it.
    expect(screen.queryByText(/user\.security\.twoStep\.secondWay\./)).not.toBeInTheDocument();
  });

  it('in the app, says to enrol on the web first and creates no flow', () => {
    mockAppMode = true;

    renderRoute();

    expect(screen.getByText('secondFactorPage.app')).toBeInTheDocument();
    expect(useKratosFlowSpy).not.toHaveBeenCalled();
  });
});
