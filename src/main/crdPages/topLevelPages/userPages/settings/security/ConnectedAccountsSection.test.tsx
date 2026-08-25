import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConnectedAccountsModel } from './connectedAccountsFlowAdapter';
import { readConnectedAccountsMarker, writeConnectedAccountsMarker } from './connectedAccountsOutcomeMarker';

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

describe('ConnectedAccountsSection — credential row manage links', () => {
  it('points at the in-page anchors rather than reloading the settings URL', () => {
    // `UserSecurityTabView` renders `#password` / `#passkeys` on this same page. A full
    // settings URL rendered as a plain <a> reloaded the document to reach a section that
    // was already on screen.
    render(
      <ConnectedAccountsSection
        status="ready"
        model={baseModel({
          credentials: [
            { kind: 'password', present: true },
            { kind: 'passkey', present: false },
          ],
        })}
        flowWasResumed={false}
        onRetry={vi.fn()}
      />
    );

    const hrefs = screen.getAllByRole('link').map(link => link.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['#password', '#passkeys']));
    expect(hrefs.every(href => href?.startsWith('#'))).toBe(true);
  });
});

describe('ConnectedAccountsSection — marker lifetime across a failed landing', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('consumes the marker when the section settles unavailable, and announces nothing', () => {
    // A redirect that lands while the flow or the auth-methods query is failing settles as
    // `unavailable`. The marker used to survive that (it is trusted for 15 minutes), so a
    // resolved attempt could announce itself on some later, unrelated visit to the section.
    writeConnectedAccountsMarker('link', 'github');

    render(
      <ConnectedAccountsSection
        status="unavailable"
        model={baseModel({ status: 'unavailable' })}
        flowWasResumed={false}
        onRetry={vi.fn()}
      />
    );

    expect(readConnectedAccountsMarker()).toBeNull();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('does not resurrect a consumed marker on a later successful visit', () => {
    writeConnectedAccountsMarker('link', 'github');

    const { unmount } = render(
      <ConnectedAccountsSection
        status="unavailable"
        model={baseModel({ status: 'unavailable' })}
        flowWasResumed={false}
        onRetry={vi.fn()}
      />
    );
    unmount();

    render(
      <ConnectedAccountsSection
        status="ready"
        model={baseModel({ providers: [githubConnected] })}
        flowWasResumed={false}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('ConnectedAccountsSection — marker fallback announcement (FR-012, research D5)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('announces success (role=status, names the provider) when a fresh unlink marker matches the now-not-connected state', () => {
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({ providers: [githubNotConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={false} onRetry={vi.fn()} />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('user.security.connectedAccounts.messages.unlinked:GitHub');
  });

  it('announces success (role=status, names the provider) when a fresh link marker matches the now-connected state', () => {
    writeConnectedAccountsMarker('link', 'github');
    const model = baseModel({ providers: [githubConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={false} onRetry={vi.fn()} />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('user.security.connectedAccounts.messages.linked:GitHub');
  });

  it('announces failure (role=alert, names the provider, offers retry copy) when a marker exists but the state did not change', () => {
    // Wrote an unlink marker, but the row is still connected after reload — the attempt did not
    // complete (FR-019/FR-020).
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({ providers: [githubConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={false} onRetry={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('user.security.connectedAccounts.messages.disconnectFailed:GitHub');
  });

  it('announces a connect failure when a link marker does not resolve to a connected row', () => {
    writeConnectedAccountsMarker('link', 'github');
    const model = baseModel({ providers: [githubNotConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={false} onRetry={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('user.security.connectedAccounts.messages.connectFailed:GitHub');
  });

  it('yields to a rendered Kratos flow message and does not double-announce (marker still consumed)', () => {
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({
      providers: [githubNotConnected],
      messages: [{ id: 1050001, type: 'success', text: 'Your changes have been saved!' }],
    });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={false} onRetry={vi.fn()} />);

    // Exactly the real Kratos message renders — no synthetic marker message alongside it.
    const statusNodes = screen.getAllByRole('status');
    expect(statusNodes).toHaveLength(1);
    expect(statusNodes[0]).toHaveTextContent('Your changes have been saved!');
    expect(screen.queryByText(/messages\.unlinked/)).not.toBeInTheDocument();
  });

  it('renders nothing extra when there is no marker', () => {
    const model = baseModel({ providers: [githubNotConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={false} onRetry={vi.fn()} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not announce while the section is still loading — waits for a settled ready state', () => {
    writeConnectedAccountsMarker('unlink', 'github');

    const { rerender } = render(
      <ConnectedAccountsSection status="loading" model={baseModel()} flowWasResumed={false} onRetry={vi.fn()} />
    );
    // The loading skeleton itself is a `role="status"` output, so assert on the marker text
    // specifically rather than on the role — no announcement has been derived yet.
    expect(screen.queryByText(/messages\.unlinked/)).not.toBeInTheDocument();

    rerender(
      <ConnectedAccountsSection
        status="ready"
        model={baseModel({ providers: [githubNotConnected] })}
        flowWasResumed={false}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('user.security.connectedAccounts.messages.unlinked:GitHub');
  });
});

describe('ConnectedAccountsSection — privileged-session re-auth interruption', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('does not announce a failure when the marker is unresolved on a RESUMED flow — it points back at the pending action instead (role=status, not role=alert)', () => {
    // A privileged-session refresh interrupted the unlink submit before Kratos ever processed it —
    // the row is unchanged, and this render is a resumed flow (Kratos's `<ui_url>?flow=<id>`
    // redirect-back convention), not a freshly-provisioned one.
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({ providers: [githubConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={true} onRetry={vi.fn()} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/messages\.disconnectFailed/)).not.toBeInTheDocument();
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('user.security.connectedAccounts.messages.reauthRequiredDisconnect:GitHub');
  });

  it('does the same for a link marker on a resumed flow', () => {
    writeConnectedAccountsMarker('link', 'github');
    const model = baseModel({ providers: [githubNotConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={true} onRetry={vi.fn()} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('user.security.connectedAccounts.messages.reauthRequiredConnect:GitHub');
  });

  it('still announces the real failure/success outcome on a FRESH flow — flowWasResumed only changes the unresolved-marker case', () => {
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({ providers: [githubConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={false} onRetry={vi.fn()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'user.security.connectedAccounts.messages.disconnectFailed:GitHub'
    );
  });

  it('a resumed flow does not affect a marker that DID resolve — success still announces normally', () => {
    writeConnectedAccountsMarker('unlink', 'github');
    const model = baseModel({ providers: [githubNotConnected] });

    render(<ConnectedAccountsSection status="ready" model={model} flowWasResumed={true} onRetry={vi.fn()} />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('user.security.connectedAccounts.messages.unlinked:GitHub');
  });
});
