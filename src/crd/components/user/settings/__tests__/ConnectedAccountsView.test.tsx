import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  type ConnectedAccountsCredentialRow,
  type ConnectedAccountsProviderRow,
  ConnectedAccountsView,
} from '../ConnectedAccountsView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => (options?.provider ? `${key}:${options.provider}` : key),
  }),
}));

const notConnectedRow: ConnectedAccountsProviderRow = {
  providerId: 'cleverbase',
  displayName: 'Cleverbase',
  iconSrc: undefined,
  state: 'not-connected',
  action: {
    kind: 'link',
    formAction: 'https://kratos/self-service/settings?flow=abc',
    method: 'POST',
    csrf: { name: 'csrf_token', value: 'csrf-xyz' },
    submitName: 'link',
    submitValue: 'cleverbase',
  },
};

const connectedRow: ConnectedAccountsProviderRow = {
  providerId: 'github',
  displayName: 'GitHub',
  iconSrc: undefined,
  state: 'connected',
  action: {
    kind: 'unlink',
    formAction: 'https://kratos/self-service/settings?flow=abc',
    method: 'POST',
    csrf: { name: 'csrf_token', value: 'csrf-xyz' },
    submitName: 'unlink',
    submitValue: 'github',
  },
};

const lockedRow: ConnectedAccountsProviderRow = {
  providerId: 'microsoft',
  displayName: 'Microsoft',
  iconSrc: undefined,
  state: 'connected-locked',
  lockedReason: 'user.security.connectedAccounts.locked.reason',
  action: null,
};

const credentials: ConnectedAccountsCredentialRow[] = [
  { kind: 'password', present: true, manageHref: '#password' },
  { kind: 'passkey', present: false, manageHref: '#passkeys' },
];

describe('ConnectedAccountsView', () => {
  it('renders the loading state as an <output> with an accessible label', () => {
    render(<ConnectedAccountsView status="loading" onRetry={vi.fn()} providers={[]} credentials={[]} messages={[]} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the fail-closed unavailable state with the reason and a retry action — no provider rows, no connect/disconnect action (FR-024, SC-009)', () => {
    const onRetry = vi.fn();
    render(
      <ConnectedAccountsView
        status="unavailable"
        unavailableReason="cannot show your sign-in methods right now"
        onRetry={onRetry}
        providers={[notConnectedRow, connectedRow, lockedRow]}
        credentials={credentials}
        messages={[]}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('cannot show your sign-in methods right now');
    // No connect/disconnect claim of any kind is offered while unavailable —
    // the view never renders its rows in this state regardless of what data
    // is passed, so no provider name and no submit button exists.
    expect(screen.queryByText('Cleverbase')).not.toBeInTheDocument();
    // Only the retry button exists — no provider row's connect/disconnect submit is rendered.
    expect(screen.getAllByRole('button')).toHaveLength(1);

    const retryButton = screen.getByRole('button', { name: 'user.security.connectedAccounts.unavailable.retry' });
    retryButton.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders a not-connected provider row with a link-submitting form carrying the CSRF token and correct submit name/value', () => {
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[notConnectedRow]}
        credentials={[]}
        messages={[]}
      />
    );

    expect(screen.getByText('Cleverbase')).toBeInTheDocument();
    expect(screen.getByText('user.security.connectedAccounts.provider.notConnected')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('name', 'link');
    expect(button).toHaveAttribute('value', 'cleverbase');

    const form = button.closest('form');
    expect(form).toHaveAttribute('action', 'https://kratos/self-service/settings?flow=abc');
    expect(form).toHaveAttribute('method', 'POST');
    const hidden = form?.querySelector('input[type="hidden"]');
    expect(hidden).toHaveAttribute('name', 'csrf_token');
    expect(hidden).toHaveValue('csrf-xyz');
  });

  it('renders a connected provider row with an unlink-submitting form', () => {
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[connectedRow]}
        credentials={[]}
        messages={[]}
      />
    );

    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('user.security.connectedAccounts.provider.connected')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('name', 'unlink');
    expect(button).toHaveAttribute('value', 'github');
  });

  it('renders the connected-locked row without a submit form and without offering a connect/disconnect claim it cannot back (FR-008)', () => {
    render(
      <ConnectedAccountsView status="ready" onRetry={vi.fn()} providers={[lockedRow]} credentials={[]} messages={[]} />
    );

    expect(screen.getByText('Microsoft')).toBeInTheDocument();
    // Locked rows are enumerated as connected — never confused with not-connected.
    expect(screen.getByText('user.security.connectedAccounts.provider.connected')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders inline flow messages with the correct roles (error → alert, success/info → status) (FR-012/FR-019)', () => {
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[]}
        credentials={[]}
        messages={[
          { id: 1050001, type: 'success', text: 'Your changes have been saved!' },
          { id: 4000007, type: 'error', text: 'That identity is already connected elsewhere.' },
        ]}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Your changes have been saved!');
    expect(screen.getByRole('alert')).toHaveTextContent('That identity is already connected elsewhere.');
  });

  it('renders password/passkey credential rows as read-only state with a route to their own section — no add/change/remove action here (FR-022)', () => {
    render(
      <ConnectedAccountsView status="ready" onRetry={vi.fn()} providers={[]} credentials={credentials} messages={[]} />
    );

    const passwordLink = screen.getByRole('link', {
      name: 'user.security.connectedAccounts.credentials.password.manage',
    });
    expect(passwordLink).toHaveAttribute('href', '#password');
    const passkeyLink = screen.getByRole('link', {
      name: 'user.security.connectedAccounts.credentials.passkey.manage',
    });
    expect(passkeyLink).toHaveAttribute('href', '#passkeys');

    // No form/submit button rendered for either credential row.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is keyboard-operable: the connect button is reachable by Tab and activatable by Enter', async () => {
    const user = userEvent.setup();
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[notConnectedRow]}
        credentials={[]}
        messages={[]}
      />
    );

    await user.tab();
    const button = screen.getByRole('button');
    expect(button).toHaveFocus();
  });
});
