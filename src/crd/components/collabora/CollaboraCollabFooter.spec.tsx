/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import { CollaboraCollabFooter } from './CollaboraCollabFooter';

// The `crd-space` namespace is lazy-loaded, so preload it (and pin English) to avoid the
// component suspending on first render in the test environment.
beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-space');
});

describe('CollaboraCollabFooter disconnect UX', () => {
  it('announces an at-risk disconnect assertively and offers keyboard-operable recovery actions', async () => {
    const onReconnect = vi.fn();
    const onReload = vi.fn();
    render(
      <CollaboraCollabFooter
        saveStatus="unsaved"
        readonlyReason={null}
        disconnected={true}
        disconnectCause="network"
        changesAtRisk={true}
        onReconnect={onReconnect}
        onReload={onReload}
      />
    );

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(/may not be saved/i);
    expect(status).toHaveAttribute('aria-live', 'assertive');

    // Recovery controls are real buttons — reachable and operable without a pointer.
    const reconnect = screen.getByRole('button', { name: 'Reconnect' });
    await userEvent.click(reconnect);
    expect(onReconnect).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(onReload).toHaveBeenCalledOnce();
  });

  it('announces a read-only / no-unsaved-work disconnect politely, without a loss warning', () => {
    render(
      <CollaboraCollabFooter
        saveStatus="saved"
        readonlyReason={null}
        disconnected={true}
        disconnectCause="service"
        changesAtRisk={false}
      />
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).not.toHaveTextContent(/may not be saved/i);
  });

  it('shows a soft reconnecting indicator with no recovery buttons', () => {
    render(
      <CollaboraCollabFooter
        saveStatus="saved"
        readonlyReason={null}
        reconnecting={true}
        disconnectCause="network"
        onReconnect={vi.fn()}
        onReload={vi.fn()}
      />
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('button', { name: 'Reconnect' })).toBeNull();
  });

  it('shows a terminal message with no retry when recovery is impossible', () => {
    render(
      <CollaboraCollabFooter
        saveStatus="unsaved"
        readonlyReason={null}
        disconnected={true}
        terminal={true}
        terminalReason="notFound"
        onReconnect={vi.fn()}
        onReload={vi.fn()}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent(/no longer available/i);
    expect(screen.queryByRole('button', { name: 'Reconnect' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reload' })).toBeNull();
  });
});
