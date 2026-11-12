import type { SettingsFlow, UiNode, UiNodeInputAttributes } from '@ory/kratos-client';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enrolledSecondFactorSettingsFlow, secondFactorSettingsFlow } from './__fixtures__/secondFactorFlows';
import { SecondFactorCrdRoute } from './SecondFactorCrdRoute';

// The fixture lists every node the methods can emit; a person with nothing enrolled is offered only
// the generation of recovery codes, so the enrolled-only nodes are dropped.
const ENROLLED_ONLY = new Set(['lookup_secret_reveal', 'lookup_secret_confirm', 'lookup_secret_disable']);
const notEnrolledFlow = {
  ...secondFactorSettingsFlow,
  ui: {
    ...secondFactorSettingsFlow.ui,
    nodes: secondFactorSettingsFlow.ui.nodes.filter(
      (node: UiNode) =>
        !ENROLLED_ONLY.has((node.attributes as UiNodeInputAttributes).name) &&
        !(node.attributes.node_type === 'text' && node.group === 'lookup_secret')
    ),
  },
} as SettingsFlow;

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
    mockFlow = notEnrolledFlow;
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

    expect(usePasskeyScriptSpy).toHaveBeenCalledWith(notEnrolledFlow.ui.nodes);
  });

  // Signing in again must first end the identity-provider session: a sign-in that rode it would
  // complete with no prompt and never ask for the second step.
  it('once a factor is enrolled, says to sign in again, through the logout that ends the session', () => {
    mockFlow = enrolledSecondFactorSettingsFlow;

    renderRoute();

    expect(screen.getByText('secondFactorPage.enrolled')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'secondFactorPage.signInAgain' })).toHaveAttribute('href', '/logout');
    expect(screen.queryByText('user.security.twoStep.authenticator.setUp')).not.toBeInTheDocument();
  });

  it('in the app, says to enrol on the web first and creates no flow', () => {
    mockAppMode = true;

    renderRoute();

    expect(screen.getByText('secondFactorPage.app')).toBeInTheDocument();
    expect(useKratosFlowSpy).not.toHaveBeenCalled();
  });
});
