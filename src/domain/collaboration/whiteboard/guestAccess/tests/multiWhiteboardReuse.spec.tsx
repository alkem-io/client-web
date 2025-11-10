/**
 * Integration tests for multi-whiteboard guest session reuse
 * Tests that guest name persists across multiple public whiteboard pages
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { GuestSessionProvider } from '../context/GuestSessionContext';
import { useGuestSession } from '../hooks/useGuestSession';
import { FC, useEffect } from 'react';

// Test component that uses the guest session
const TestWhiteboardComponent: FC<{ whiteboardId: string; onGuestNameReady?: (name: string | null) => void }> = ({
  whiteboardId,
  onGuestNameReady,
}) => {
  const { guestName, setGuestName } = useGuestSession();

  useEffect(() => {
    if (onGuestNameReady) {
      onGuestNameReady(guestName);
    }
  }, [guestName, onGuestNameReady]);

  return (
    <div>
      <h1>Whiteboard: {whiteboardId}</h1>
      <div data-testid="guest-name">{guestName || 'No guest name'}</div>
      <button onClick={() => setGuestName('TestGuest')}>Set Guest Name</button>
    </div>
  );
};

describe('Multi-Whiteboard Guest Session Reuse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    cleanup();
  });

  afterEach(() => {
    sessionStorage.clear();
    cleanup();
  });

  describe('Session persistence across whiteboards', () => {
    it('should persist guest name when navigating to a different whiteboard', async () => {
      // Render first whiteboard and set guest name
      const { unmount } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="whiteboard-1" />
        </GuestSessionProvider>
      );

      // Set guest name
      const setButton = screen.getByText('Set Guest Name');
      setButton.click();

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });

      // Verify session storage has the name
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('TestGuest');

      // Unmount first whiteboard (simulating navigation away)
      unmount();

      // Render second whiteboard (different whiteboard ID)
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="whiteboard-2" />
        </GuestSessionProvider>
      );

      // Guest name should be automatically loaded from session storage
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });

      // Different whiteboard is shown but same guest name
      expect(screen.getByText('Whiteboard: whiteboard-2')).toBeInTheDocument();
    });

    it('should reuse guest name without prompting on second whiteboard', async () => {
      // Set guest name in session storage before mounting
      sessionStorage.setItem('alkemio_guest_name', 'ExistingGuest');

      const guestNameCallback = vi.fn();

      // Render whiteboard - should immediately have guest name
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="whiteboard-3" onGuestNameReady={guestNameCallback} />
        </GuestSessionProvider>
      );

      // Should load guest name from storage immediately
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('ExistingGuest');
      });

      // Callback should be called with existing guest name
      expect(guestNameCallback).toHaveBeenCalledWith('ExistingGuest');
    });

    it('should maintain same guest name across multiple whiteboard mounts', async () => {
      sessionStorage.setItem('alkemio_guest_name', 'PersistentGuest');

      // Mount whiteboard 1
      const { unmount: unmount1 } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="wb-1" />
        </GuestSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('PersistentGuest');
      });

      unmount1();

      // Mount whiteboard 2
      const { unmount: unmount2 } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="wb-2" />
        </GuestSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('PersistentGuest');
      });

      unmount2();

      // Mount whiteboard 3
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="wb-3" />
        </GuestSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('PersistentGuest');
      });

      // All three whiteboards should use the same guest name
      expect(sessionStorage.getItem('alkemio_guest_name')).toBe('PersistentGuest');
    });
  });

  describe('Session updates across whiteboard instances', () => {
    it('should not prompt for guest name on subsequent whiteboard if name exists', async () => {
      // User visits first whiteboard and sets name
      const { unmount } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="first-wb" />
        </GuestSessionProvider>
      );

      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });

      unmount();

      // User navigates to second whiteboard
      const onGuestNameReady = vi.fn();
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="second-wb" onGuestNameReady={onGuestNameReady} />
        </GuestSessionProvider>
      );

      // Should immediately have guest name, no prompt needed
      await waitFor(() => {
        expect(onGuestNameReady).toHaveBeenCalledWith('TestGuest');
      });

      expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
    });

    it('should handle session storage being cleared mid-session', async () => {
      sessionStorage.setItem('alkemio_guest_name', 'InitialGuest');

      const { unmount } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="wb-clear-test" />
        </GuestSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('InitialGuest');
      });

      // Simulate session storage being cleared (e.g., by another tab or user action)
      sessionStorage.clear();

      unmount();

      // New whiteboard mount should not have guest name
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="wb-after-clear" />
        </GuestSessionProvider>
      );

      // Should show no guest name since storage was cleared
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
      });
    });
  });

  describe('Session isolation between different contexts', () => {
    it('should share guest name across provider instances via session storage', async () => {
      sessionStorage.clear();

      // Render first provider and set guest name
      const { unmount: unmount1 } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="isolated-1" />
        </GuestSessionProvider>
      );

      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });

      unmount1();

      // Render second provider - should load same guest name from storage
      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="isolated-2" />
        </GuestSessionProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });
    });
  });

  describe('Session storage availability checks', () => {
    it('should handle unavailable session storage gracefully', () => {
      // Mock session storage to throw
      const originalSessionStorage = window.sessionStorage;
      Object.defineProperty(window, 'sessionStorage', {
        get: () => {
          throw new Error('Session storage unavailable');
        },
        configurable: true,
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="storage-unavailable" />
        </GuestSessionProvider>
      );

      // Should warn about unavailable storage
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Session storage unavailable:',
        expect.any(Error)
      );

      // Restore
      Object.defineProperty(window, 'sessionStorage', {
        value: originalSessionStorage,
        configurable: true,
      });
      consoleWarnSpy.mockRestore();
    });

    it('should handle session storage quota exceeded gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock setItem to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="quota-test" />
        </GuestSessionProvider>
      );

      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Failed to persist guest name:',
          expect.any(Error)
        );
      });

      // Restore
      Storage.prototype.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Guest name updates propagate correctly', () => {
    it('should update session storage when guest name changes', async () => {
      const { rerender } = render(
        <GuestSessionProvider>
          <TestWhiteboardComponent whiteboardId="update-test" />
        </GuestSessionProvider>
      );

      // Set initial guest name
      screen.getByText('Set Guest Name').click();

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('TestGuest');
      });

      // Change guest name
      const TestComponentWithUpdate: FC = () => {
        const { setGuestName } = useGuestSession();
        return (
          <div>
            <button onClick={() => setGuestName('UpdatedGuest')}>Update Name</button>
          </div>
        );
      };

      rerender(
        <GuestSessionProvider>
          <TestComponentWithUpdate />
        </GuestSessionProvider>
      );

      screen.getByText('Update Name').click();

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('UpdatedGuest');
      });
    });
  });
});
