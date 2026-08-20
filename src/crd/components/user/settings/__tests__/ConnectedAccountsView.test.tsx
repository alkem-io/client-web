import { fireEvent, render, screen } from '@testing-library/react';
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
  lockedReason: 'This is your only way to sign in right now — add a password or a passkey below first.',
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

  it('mounts the outcome live region before any status settles, and keeps the same node across a status transition', () => {
    // A live region only announces mutations that occur after it exists in the DOM — if the
    // container carrying flow messages is only created once `status` reaches 'ready', assistive
    // tech never observes the transition and the outcome goes unannounced.
    const { container, rerender } = render(
      <ConnectedAccountsView status="loading" onRetry={vi.fn()} providers={[]} credentials={[]} messages={[]} />
    );
    const liveRegionAtLoading = container.querySelector('[aria-live="polite"]');
    expect(liveRegionAtLoading).toBeInTheDocument();
    expect(liveRegionAtLoading).toBeEmptyDOMElement();

    rerender(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[]}
        credentials={[]}
        messages={[{ id: 1050001, type: 'success', text: 'Your changes have been saved!' }]}
      />
    );

    const liveRegionAtReady = container.querySelector('[aria-live="polite"]');
    // Same DOM node, not a fresh element created by the 'ready' branch — its content mutated in
    // place, which is exactly what a live region needs to be observed as a mutation.
    expect(liveRegionAtReady).toBe(liveRegionAtLoading);
    expect(liveRegionAtReady).toHaveTextContent('Your changes have been saved!');
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

  it('renders the connected-locked row as a reachable-but-blocked control with its reason wired via aria-describedby (FR-008, research D7)', () => {
    render(
      <ConnectedAccountsView status="ready" onRetry={vi.fn()} providers={[lockedRow]} credentials={[]} messages={[]} />
    );

    expect(screen.getByText('Microsoft')).toBeInTheDocument();
    // Locked rows are enumerated as connected — never confused with not-connected.
    expect(screen.getByText('user.security.connectedAccounts.provider.connected')).toBeInTheDocument();

    const button = screen.getByRole('button');
    // aria-disabled, never the native `disabled` attribute — the control stays
    // in the tab order and reachable, unlike a truly disabled button.
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('name'); // no submit — this button posts nothing

    const caption = screen.getByText(lockedRow.lockedReason as string);
    expect(caption.id).toBeTruthy();
    expect(button).toHaveAttribute('aria-describedby', caption.id);

    // No submit-capable form exists for this row — disconnecting is blocked,
    // not silently postable.
    expect(document.querySelector('form')).not.toBeInTheDocument();
  });

  it('never calls a disconnect submit for the locked row on click — it is a no-op control', async () => {
    const user = userEvent.setup();
    render(
      <ConnectedAccountsView status="ready" onRetry={vi.fn()} providers={[lockedRow]} credentials={[]} messages={[]} />
    );

    const button = screen.getByRole('button');
    await user.click(button);
    // Still present, still not a submit — clicking an aria-disabled control does nothing.
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(document.querySelector('form')).not.toBeInTheDocument();
  });

  it('distinguishes locked from a plain connected row by more than colour: only the locked row carries a visible reason and a described-by control', () => {
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[connectedRow, lockedRow]}
        credentials={[]}
        messages={[]}
      />
    );

    const [connectedButton, lockedButton] = screen.getAllByRole('button');
    expect(connectedButton).not.toHaveAttribute('aria-disabled');
    expect(connectedButton).toHaveAttribute('name', 'unlink');
    expect(lockedButton).toHaveAttribute('aria-disabled', 'true');
    expect(lockedButton).toHaveAttribute('aria-describedby');
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

  it('calls onProviderActionSubmit with the row when its native form submits (research D5)', () => {
    const onProviderActionSubmit = vi.fn();
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[notConnectedRow]}
        credentials={[]}
        messages={[]}
        onProviderActionSubmit={onProviderActionSubmit}
      />
    );

    const form = screen.getByRole('button').closest('form') as HTMLFormElement;
    // Dispatching the `submit` event directly exercises the same handler a real browser click would
    // trigger, without going through jsdom's unimplemented `HTMLFormElement.requestSubmit` navigation
    // machinery.
    fireEvent.submit(form);

    expect(onProviderActionSubmit).toHaveBeenCalledTimes(1);
    expect(onProviderActionSubmit).toHaveBeenCalledWith(notConnectedRow);
  });

  it('confirms before disconnecting (CRD Golden Rule 9): submitting an unlink row opens a confirmation and does not call onProviderActionSubmit yet', () => {
    const onProviderActionSubmit = vi.fn();
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[connectedRow]}
        credentials={[]}
        messages={[]}
        onProviderActionSubmit={onProviderActionSubmit}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'user.security.connectedAccounts.actions.disconnectAria:GitHub' })
    );

    expect(onProviderActionSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('user.security.connectedAccounts.confirmDisconnect.title:GitHub')).toBeInTheDocument();
  });

  it('only calls onProviderActionSubmit once the disconnect confirmation is accepted', () => {
    const onProviderActionSubmit = vi.fn();
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[connectedRow]}
        credentials={[]}
        messages={[]}
        onProviderActionSubmit={onProviderActionSubmit}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'user.security.connectedAccounts.actions.disconnectAria:GitHub' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'user.security.connectedAccounts.confirmDisconnect.confirm' }));

    expect(onProviderActionSubmit).toHaveBeenCalledTimes(1);
    expect(onProviderActionSubmit).toHaveBeenCalledWith(connectedRow);
  });

  it('cancelling the disconnect confirmation calls onProviderActionSubmit for neither the link nor the unlink outcome', () => {
    const onProviderActionSubmit = vi.fn();
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[connectedRow]}
        credentials={[]}
        messages={[]}
        onProviderActionSubmit={onProviderActionSubmit}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'user.security.connectedAccounts.actions.disconnectAria:GitHub' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'dialogs.cancel' }));

    expect(onProviderActionSubmit).not.toHaveBeenCalled();
    expect(
      screen.queryByText('user.security.connectedAccounts.confirmDisconnect.title:GitHub')
    ).not.toBeInTheDocument();
  });

  it('does not confirm a connect (link) submit — onProviderActionSubmit fires straight from the native submit', () => {
    const onProviderActionSubmit = vi.fn();
    render(
      <ConnectedAccountsView
        status="ready"
        onRetry={vi.fn()}
        providers={[notConnectedRow]}
        credentials={[]}
        messages={[]}
        onProviderActionSubmit={onProviderActionSubmit}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'user.security.connectedAccounts.actions.connectAria:Cleverbase' })
    );

    expect(onProviderActionSubmit).toHaveBeenCalledTimes(1);
    expect(onProviderActionSubmit).toHaveBeenCalledWith(notConnectedRow);
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
