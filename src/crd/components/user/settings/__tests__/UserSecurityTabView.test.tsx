import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConnectedAccountsView } from '../ConnectedAccountsView';
import { UserSecurityTabView, type UserSecurityViewState } from '../UserSecurityTabView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('UserSecurityTabView', () => {
  it(
    'keeps the Connected Accounts outcome live region mounted at the same node across the ' +
      "tab's own loading -> ready transition (corr-client-web-6, spec-client-web-1)",
    () => {
      // Reproduces the real integration shape: the tab's own `state.kind` (driven by the Kratos
      // settings-flow + auth-methods queries) can still be 'loading' on the very render where
      // Kratos's redirect lands with an outcome message already resolved server-side. If the
      // 'loading' branch drops the Connected Accounts card instead of rendering it (with its own
      // 'loading' status), the live region inside it is inserted for the first time already
      // populated once `state` reaches 'ready', and a live region only announces mutations that
      // happen after it exists — so nothing is ever announced.
      const connectedAccountsSection = (
        <ConnectedAccountsView
          status="ready"
          onRetry={vi.fn()}
          providers={[]}
          credentials={[]}
          messages={[{ id: 1050001, type: 'success', text: 'Your changes have been saved!' }]}
        />
      );

      const loadingState: UserSecurityViewState = { kind: 'loading' };
      const readyState: UserSecurityViewState = { kind: 'ready', hasPassword: true, hasWebauthn: false };

      const { container, rerender } = render(
        <UserSecurityTabView
          state={loadingState}
          passwordForm={null}
          webauthnForm={null}
          mcpApiKeysCard={null}
          connectedAccountsSection={connectedAccountsSection}
          deleteAccountCard={null}
        />
      );

      const liveRegionAtLoading = container.querySelector('[aria-live="polite"]');
      expect(liveRegionAtLoading).toBeInTheDocument();

      rerender(
        <UserSecurityTabView
          state={readyState}
          passwordForm={null}
          webauthnForm={null}
          mcpApiKeysCard={null}
          connectedAccountsSection={connectedAccountsSection}
          deleteAccountCard={null}
        />
      );

      const liveRegionAtReady = container.querySelector('[aria-live="polite"]');
      // Same DOM node across the tab's own loading -> ready transition, not a node freshly created
      // by the 'ready' branch that already carries the outcome message on first paint.
      expect(liveRegionAtReady).toBe(liveRegionAtLoading);
      expect(liveRegionAtReady).toHaveTextContent('Your changes have been saved!');
    }
  );

  it(
    "still renders the Connected Accounts section's own unavailable reason + retry, with zero " +
      "provider rows, when the tab's state is 'error' — a Kratos settings-flow load failure " +
      '(network/5xx) fails the whole tab closed, but Connected Accounts must fail closed on its ' +
      'own terms rather than disappear entirely (FR-024, spec-client-web-1)',
    async () => {
      const onRetry = vi.fn();
      const connectedAccountsSection = (
        <ConnectedAccountsView
          status="unavailable"
          unavailableReason="user.security.connectedAccounts.unavailable.message"
          onRetry={onRetry}
          providers={[]}
          credentials={[]}
          messages={[]}
        />
      );

      const errorState: UserSecurityViewState = { kind: 'error' };
      const user = userEvent.setup();

      const { container } = render(
        <UserSecurityTabView
          state={errorState}
          passwordForm={null}
          webauthnForm={null}
          mcpApiKeysCard={null}
          connectedAccountsSection={connectedAccountsSection}
          deleteAccountCard={null}
        />
      );

      expect(screen.getByText('user.security.connectedAccounts.unavailable.message')).toBeInTheDocument();
      // Zero provider/credential rows — the unavailable branch renders neither, never a guess.
      expect(container.querySelectorAll('li')).toHaveLength(0);

      const retryButton = screen.getByRole('button', {
        name: 'user.security.connectedAccounts.unavailable.retry',
      });
      expect(retryButton).toBeInTheDocument();

      await user.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    }
  );

  it.each<[string, UserSecurityViewState]>([
    ['loading', { kind: 'loading' }],
    ['error', { kind: 'error' }],
    ['ready', { kind: 'ready', hasPassword: true, hasWebauthn: false }],
  ])(
    "renders the Delete-account slot in the '%s' state (spec-cw-3, FR-001) — the app-store-mandated " +
      'deletion entry point is self-contained and must never disappear because an unrelated Kratos ' +
      'settings-flow load is slow or failed',
    (_label, state) => {
      render(
        <UserSecurityTabView
          state={state}
          passwordForm={null}
          webauthnForm={null}
          mcpApiKeysCard={null}
          connectedAccountsSection={null}
          deleteAccountCard={<div data-testid="delete-account-card-probe">delete card</div>}
        />
      );

      expect(screen.getByTestId('delete-account-card-probe')).toBeInTheDocument();
    }
  );

  // The one deliberate exception to the rule above. `sessionExpired` is not a
  // failure to load the Security tab — it means the identity-provider session
  // is gone, so a deletion attempted from here could not satisfy the server's
  // session-age gate anyway. Offering the entry point would be a dead end, so
  // it is withheld on purpose rather than by oversight.
  it('withholds the Delete-account slot in the lapsed-session state, where deletion could not succeed', () => {
    render(
      <UserSecurityTabView
        state={{ kind: 'sessionExpired', reauthHref: '/logout' }}
        passwordForm={null}
        webauthnForm={null}
        mcpApiKeysCard={null}
        connectedAccountsSection={null}
        deleteAccountCard={<div data-testid="delete-account-card-probe">delete card</div>}
      />
    );

    expect(screen.queryByTestId('delete-account-card-probe')).not.toBeInTheDocument();
  });

  it(
    'renders the lapsed-identity-provider-session state with a way out rather than the generic ' +
      "'try refreshing' card — refreshing provably cannot mint a new identity-provider session, " +
      'so telling someone to do it is a dead end',
    () => {
      const sessionExpiredState: UserSecurityViewState = { kind: 'sessionExpired', reauthHref: '/logout' };

      render(
        <UserSecurityTabView
          state={sessionExpiredState}
          passwordForm={null}
          webauthnForm={null}
          mcpApiKeysCard={null}
          connectedAccountsSection={null}
          deleteAccountCard={null}
        />
      );

      expect(screen.getByText('user.security.sessionExpired.description')).toBeInTheDocument();
      // The generic failure copy — the one that tells people to refresh — must NOT appear.
      expect(screen.queryByText('user.security.errorDescription')).not.toBeInTheDocument();

      // The action points at the platform's sign-out route, not straight back at
      // sign-in: re-entering sign-in alone leaves the lapsed session lapsed,
      // because the login provider accepts the subject the broker still holds
      // for this browser without ever re-authenticating. Signing out ends the
      // broker session too, forcing the next sign-in to be a real one.
      const action = screen.getByRole('link', { name: 'user.security.sessionExpired.action' });
      expect(action).toHaveAttribute('href', '/logout');
    }
  );
});
