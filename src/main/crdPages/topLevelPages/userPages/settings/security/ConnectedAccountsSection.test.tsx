import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConnectedAccountsModel } from './connectedAccountsFlowAdapter';
import { writeConnectedAccountsMarker } from './connectedAccountsOutcomeMarker';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => (options?.provider ? `${key}:${options.provider}` : key),
  }),
}));

vi.mock('@/main/crdPages/auth/useKratosMessageCopy', () => ({
  useKratosMessageCopy: () => (messages: unknown) => messages,
}));

// Imported after the mocks above so the module under test picks up the mocked `useTranslation` /
// `useKratosMessageCopy` when it renders.
import { ConnectedAccountsSection } from './ConnectedAccountsSection';

const baseModel = (overrides: Partial<ConnectedAccountsModel> = {}): ConnectedAccountsModel => ({
  status: 'ready',
  providers: [],
  credentials: [],
  messages: [],
  ...overrides,
});

const githubNotConnected = {
  providerId: 'github',
  displayName: 'GitHub',
  iconSrc: undefined,
  state: 'not-connected' as const,
  action: null,
};

const githubConnected = {
  providerId: 'github',
  displayName: 'GitHub',
  iconSrc: undefined,
  state: 'connected' as const,
  action: null,
};

describe('ConnectedAccountsSection — marker fallback announcement (FR-012, research D5)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('announces success (role=status, names the provider) when a fresh unlink marker matches the now-not-connected state', () => {
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({ providers: [githubNotConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} profileUrl="/user/alice" onRetry={vi.fn()} />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('user.security.connectedAccounts.messages.unlinked:GitHub');
  });

  it('announces success (role=status, names the provider) when a fresh link marker matches the now-connected state', () => {
    writeConnectedAccountsMarker('link', 'github');
    const model = baseModel({ providers: [githubConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} profileUrl="/user/alice" onRetry={vi.fn()} />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('user.security.connectedAccounts.messages.linked:GitHub');
  });

  it('announces failure (role=alert, names the provider, offers retry copy) when a marker exists but the state did not change', () => {
    // Wrote an unlink marker, but the row is still connected after reload — the attempt did not
    // complete (FR-019/FR-020).
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({ providers: [githubConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} profileUrl="/user/alice" onRetry={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('user.security.connectedAccounts.messages.disconnectFailed:GitHub');
  });

  it('announces a connect failure when a link marker does not resolve to a connected row', () => {
    writeConnectedAccountsMarker('link', 'github');
    const model = baseModel({ providers: [githubNotConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} profileUrl="/user/alice" onRetry={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('user.security.connectedAccounts.messages.connectFailed:GitHub');
  });

  it('yields to a rendered Kratos flow message and does not double-announce (marker still consumed)', () => {
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({
      providers: [githubNotConnected],
      messages: [{ id: 1050001, type: 'success', text: 'Your changes have been saved!' }],
    });

    render(<ConnectedAccountsSection status="ready" model={model} profileUrl="/user/alice" onRetry={vi.fn()} />);

    // Exactly the real Kratos message renders — no synthetic marker message alongside it.
    const statusNodes = screen.getAllByRole('status');
    expect(statusNodes).toHaveLength(1);
    expect(statusNodes[0]).toHaveTextContent('Your changes have been saved!');
    expect(screen.queryByText(/messages\.unlinked/)).not.toBeInTheDocument();
  });

  it('renders nothing extra when there is no marker', () => {
    const model = baseModel({ providers: [githubNotConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} profileUrl="/user/alice" onRetry={vi.fn()} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not announce while the section is still loading — waits for a settled ready state', () => {
    writeConnectedAccountsMarker('unlink', 'github');

    const { rerender } = render(
      <ConnectedAccountsSection status="loading" model={baseModel()} profileUrl="/user/alice" onRetry={vi.fn()} />
    );
    // The loading skeleton itself is a `role="status"` output, so assert on the marker text
    // specifically rather than on the role — no announcement has been derived yet.
    expect(screen.queryByText(/messages\.unlinked/)).not.toBeInTheDocument();

    rerender(
      <ConnectedAccountsSection
        status="ready"
        model={baseModel({ providers: [githubNotConnected] })}
        profileUrl="/user/alice"
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('user.security.connectedAccounts.messages.unlinked:GitHub');
  });
});
