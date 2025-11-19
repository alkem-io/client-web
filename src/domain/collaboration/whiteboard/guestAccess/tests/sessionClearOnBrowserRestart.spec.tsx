/**
 * Integration tests for session clearing on browser restart
 * Tests that guest name is cleared when browser session ends (session storage behavior)
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@/main/test/testUtils';
import '@testing-library/jest-dom/vitest';
import { GuestSessionProvider } from '../context/GuestSessionContext';
import { useGuestSession } from '../hooks/useGuestSession';
import { FC } from 'react';

// Test component that uses the guest session
const TestWhiteboardComponent: FC<{ whiteboardId: string }> = ({ whiteboardId }) => {
  const { guestName, setGuestName } = useGuestSession();

  return (
    <div>
      <h1>Whiteboard: {whiteboardId}</h1>
      <div data-testid="guest-name">{guestName || 'No guest name'}</div>
      <button onClick={() => setGuestName('SessionGuest')}>Set Guest Name</button>
    </div>
  );
};

describe('Session Clear on Browser Restart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    cleanup();
  });

  afterEach(() => {
    sessionStorage.clear();
    cleanup();
  });

  describe('Browser session lifecycle', () => {
    it('should start with no guest name on fresh browser session', () => {
      // Simulate fresh browser session - no session storage data
      sessionStorage.clear();

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="fresh-session" />
        </GuestSessionProvider>
      );

      // Should have no guest name
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
      expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
    });

    it('should clear guest name when session storage is cleared (simulating browser restart)', async () => {
      // Set up an existing session
      sessionStorage.setItem('alkemio_guest_name', 'ExistingSessionGuest');

      const { unmount } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="session-1" />
        </GuestSessionProvider>
      );

      // Should load existing guest name
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('ExistingSessionGuest');
      });

      unmount();

      // Simulate browser restart - clear session storage
      sessionStorage.clear();

      // Render new session
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="session-2" />
        </GuestSessionProvider>
      );

      // Should have no guest name after restart
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
      expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
    });

    it('should require new guest name entry after browser restart', async () => {
      // Original session
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="original-session" />
        </GuestSessionProvider>
      );

      // Set guest name
      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('SessionGuest');
      });

      cleanup();

      // Simulate browser restart
      sessionStorage.clear();

      // New browser session
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="new-browser-session" />
        </GuestSessionProvider>
      );

      // Should not have previous session's guest name
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');

      // User must set guest name again
      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('SessionGuest');
      });
    });
  });

  describe('Session storage behavior verification', () => {
    it('should use session storage (not local storage) for guest names', async () => {
      // Verify that only sessionStorage is used, not localStorage
      localStorage.clear();
      sessionStorage.clear();

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="storage-type-test" />
        </GuestSessionProvider>
      );

      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('SessionGuest');
      });

      // Should NOT be in localStorage
      expect(localStorage.getItem('alkemio_guest_name')).toBeNull();
    });

    it('should persist within same session across page reloads', async () => {
      // Set guest name in session
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="reload-test-1" />
        </GuestSessionProvider>
      );

      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('SessionGuest');
      });

      cleanup();

      // Simulate page reload (session storage persists)
      // sessionStorage is NOT cleared (simulating same browser session)

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="reload-test-2" />
        </GuestSessionProvider>
      );

      // Guest name should still be there
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('SessionGuest');
      });
    });

    it('should handle multiple tab closures within same browser session', async () => {
      // Tab 1
      const { unmount: unmountTab1 } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="tab-1" />
        </GuestSessionProvider>
      );

      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('SessionGuest');
      });

      unmountTab1();

      // Tab 2 (same session)
      const { unmount: unmountTab2 } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="tab-2" />
        </GuestSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('SessionGuest');
      });

      unmountTab2();

      // Tab 3 (still same session)
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="tab-3" />
        </GuestSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('SessionGuest');
      });
    });
  });

  describe('Session vs persistent storage distinction', () => {
    it('should demonstrate difference between session and local storage', async () => {
      // Set something in localStorage (persistent)
      localStorage.setItem('persistent_data', 'persists-across-sessions');

      // Set guest name in sessionStorage
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="storage-comparison" />
        </GuestSessionProvider>
      );

      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('SessionGuest');
      });

      cleanup();

      // Simulate browser restart - clear session storage only
      sessionStorage.clear();
      // localStorage is NOT cleared (would persist in real browser)

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="after-restart" />
        </GuestSessionProvider>
      );

      // Guest name is gone (sessionStorage cleared)
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
      expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();

      // But localStorage data would persist (in real browser restart)
      expect(localStorage.getItem('persistent_data')).toBe('persists-across-sessions');

      // Cleanup
      localStorage.clear();
    });

    it('should not persist guest name beyond browser session', () => {
      // This test documents the expected behavior:
      // sessionStorage is cleared when browser closes,
      // so guest names do NOT persist across browser restarts

      sessionStorage.setItem('alkemio_guest_name', 'TemporaryGuest');

      // Simulate browser close
      sessionStorage.clear();

      // New browser session
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="new-browser-instance" />
        </GuestSessionProvider>
      );

      // Guest name should be gone
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle corrupted session storage data gracefully', () => {
      // Set invalid/empty data
      sessionStorage.setItem('alkemio_guest_name', ''); // empty string

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="corrupted-data" />
        </GuestSessionProvider>
      );

      // Empty string is treated as no guest name (falsy)
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
    });

    it('should handle session storage disabled/unavailable', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock sessionStorage.getItem to throw
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('Session storage unavailable');
      });

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="storage-unavailable" />
        </GuestSessionProvider>
      );

      // Should warn about unavailable storage
      expect(consoleWarnSpy).toHaveBeenCalledWith('Session storage unavailable:', expect.any(Error));

      // Should gracefully handle and show no guest name
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');

      // Restore
      Storage.prototype.getItem = originalGetItem;
      consoleWarnSpy.mockRestore();
    });

    it('should start fresh if session storage fails to read', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock to throw on getItem but succeed on setItem
      const originalGetItem = Storage.prototype.getItem;
      let getItemCallCount = 0;
      Storage.prototype.getItem = vi.fn(key => {
        getItemCallCount++;
        if (getItemCallCount === 1) {
          throw new Error('Read failed');
        }
        return originalGetItem.call(sessionStorage, key);
      });

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="read-failure" />
        </GuestSessionProvider>
      );

      // Should start with no guest name despite read failure
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');

      // Restore
      Storage.prototype.getItem = originalGetItem;
      consoleWarnSpy.mockRestore();
    });
  });
});
