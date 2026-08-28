import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { WhiteboardDisconnectedDialog } from './WhiteboardDisconnectedDialog';

const baseProps = {
  open: true,
  onClose: vi.fn(),
  title: 'Whiteboard disconnected',
  message: 'The collaboration connection was lost.',
  canReconnect: true,
  onReconnect: vi.fn(),
  onReloadPage: vi.fn(),
};

const RELOAD_LABEL = 'disconnected.reloadPage';

describe('WhiteboardDisconnectedDialog — Reload page escape hatch (story #10131)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('does not show the Reload page button on the normal fast-reconnect path', () => {
    render(<WhiteboardDisconnectedDialog {...baseProps} canReconnect={true} reconnecting={false} />);
    expect(screen.queryByText(RELOAD_LABEL)).toBeNull();
  });

  test('shows the Reload page button once the modal stays stuck (offline) past the timeout', () => {
    render(<WhiteboardDisconnectedDialog {...baseProps} canReconnect={false} />);
    // Stale navigator.onLine window: Reconnect disabled → stuck.
    expect(screen.queryByText(RELOAD_LABEL)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByText(RELOAD_LABEL)).toBeTruthy();
  });

  test('shows the Reload page button once a busy reconnect stays stuck past the timeout', () => {
    render(<WhiteboardDisconnectedDialog {...baseProps} canReconnect={true} reconnecting={true} />);
    expect(screen.queryByText(RELOAD_LABEL)).toBeNull();
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByText(RELOAD_LABEL)).toBeTruthy();
  });

  test('shows the Reload page button immediately when an error is received', () => {
    render(<WhiteboardDisconnectedDialog {...baseProps} canReconnect={true} hasError={true} />);
    expect(screen.getByText(RELOAD_LABEL)).toBeTruthy();
  });

  test('Reload page button is always clickable and calls onReloadPage even while offline', () => {
    const onReloadPage = vi.fn();
    render(<WhiteboardDisconnectedDialog {...baseProps} canReconnect={false} onReloadPage={onReloadPage} />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    const reloadButton = screen.getByRole('button', { name: RELOAD_LABEL });
    expect(reloadButton.hasAttribute('disabled')).toBe(false);
    fireEvent.click(reloadButton);
    expect(onReloadPage).toHaveBeenCalledTimes(1);
  });

  test('the Reconnect button remains disabled while offline (behaviour unchanged)', () => {
    render(<WhiteboardDisconnectedDialog {...baseProps} canReconnect={false} />);
    const reconnectButton = screen.getByText('disconnected.reconnect').closest('button');
    expect(reconnectButton?.disabled).toBe(true);
  });

  test('hides reconnect and reload actions for a terminal unavailable verdict', () => {
    render(
      <WhiteboardDisconnectedDialog
        {...baseProps}
        canReconnect={false}
        showReconnect={false}
        onReloadPage={undefined}
        hasError={true}
      />
    );
    expect(screen.queryByText('disconnected.reconnect')).toBeNull();
    expect(screen.queryByText(RELOAD_LABEL)).toBeNull();
  });

  test('the escape hatch stays hidden when no onReloadPage callback is provided', () => {
    render(
      <WhiteboardDisconnectedDialog {...baseProps} canReconnect={false} onReloadPage={undefined} hasError={true} />
    );
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.queryByText(RELOAD_LABEL)).toBeNull();
  });
});
