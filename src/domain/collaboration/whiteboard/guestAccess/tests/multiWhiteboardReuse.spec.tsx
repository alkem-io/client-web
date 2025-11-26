/**
 * Integration tests for multi-whiteboard guest session reuse
 * Tests that guest name persists across multiple public whiteboard pages
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@/main/test/testUtils';
import '@testing-library/jest-dom/vitest';
import { GuestSessionProvider } from '../context/GuestSessionContext';
import { useGuestSession } from '../hooks/useGuestSession';
import { FC, PropsWithChildren, ReactElement, useEffect } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import i18n from '@/core/i18n/config';
import { I18nextProvider } from 'react-i18next';
import userEvent from '@testing-library/user-event';
import { sessionStorageMock } from './utils/sessionStorageMock';

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <MockedProvider mocks={[]} cache={new InMemoryCache()}>
    <RootThemeProvider>
      <I18nextProvider i18n={i18n}>
        <GuestSessionProvider>{children}</GuestSessionProvider>
      </I18nextProvider>
    </RootThemeProvider>
  </MockedProvider>
);

const renderWithProviders = (ui: ReactElement) => render(<Providers>{ui}</Providers>);

// Test component that uses the guest session
const TestWhiteboardComponent: FC<{ whiteboardId: string; onGuestNameReady?: (name: string | null) => void }> = ({
  whiteboardId,
  onGuestNameReady,
}) => {
  const { guestName, setGuestName } = useGuestSession();

  const handleSetGuestName = () => {
    setGuestName('TestGuest');
  };

  useEffect(() => {
    if (onGuestNameReady) {
      onGuestNameReady(guestName);
    }
  }, [guestName, onGuestNameReady]);

  return (
    <div>
      <h1>Whiteboard: {whiteboardId}</h1>
      <div data-testid="guest-name">{guestName || 'No guest name'}</div>
      <button onClick={handleSetGuestName}>Set Guest Name</button>
    </div>
  );
};

const TestComponentWithGuestNameUpdate: FC = () => {
  const { setGuestName } = useGuestSession();

  const handleUpdateName = () => {
    setGuestName('UpdatedGuest');
  };

  return (
    <div>
      <button onClick={handleUpdateName}>Update Name</button>
    </div>
  );
};

describe('Multi-Whiteboard Guest Session Reuse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
    cleanup();
  });

  afterEach(() => {
    sessionStorageMock.clear();
    cleanup();
  });

  describe('Session persistence across whiteboards', () => {
    it('should persist guest name when navigating to a different whiteboard', async () => {
      // Render first whiteboard and set guest name
      const { unmount } = renderWithProviders(<TestWhiteboardComponent whiteboardId="whiteboard-1" />);

      // Set guest name
      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });

      // Verify session storage has the name
      expect(sessionStorageMock.getItem('alkemio_guest_name')).toBe('TestGuest');

      // Unmount first whiteboard (simulating navigation away)
      unmount();

      // Render second whiteboard (different whiteboard ID)
      renderWithProviders(<TestWhiteboardComponent whiteboardId="whiteboard-2" />);

      // Guest name should be automatically loaded from session storage
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });

      // Different whiteboard is shown but same guest name
      expect(screen.getByText('Whiteboard: whiteboard-2')).toBeInTheDocument();
    });

    it('should reuse guest name without prompting on second whiteboard', async () => {
      // Set guest name in session storage before mounting
      sessionStorageMock.setItem('alkemio_guest_name', 'ExistingGuest');

      const guestNameCallback = vi.fn();

      // Render whiteboard - should immediately have guest name
      renderWithProviders(<TestWhiteboardComponent whiteboardId="whiteboard-3" onGuestNameReady={guestNameCallback} />);

      // Should load guest name from storage immediately
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('ExistingGuest');
      });

      // Callback should be called with existing guest name
      expect(guestNameCallback).toHaveBeenCalledWith('ExistingGuest');
    });

    it('should maintain same guest name across multiple whiteboard mounts', async () => {
      sessionStorageMock.setItem('alkemio_guest_name', 'PersistentGuest');

      // Mount whiteboard 1
      const { unmount: unmount1 } = renderWithProviders(<TestWhiteboardComponent whiteboardId="wb-1" />);

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('PersistentGuest');
      });

      unmount1();

      // Mount whiteboard 2
      const { unmount: unmount2 } = renderWithProviders(<TestWhiteboardComponent whiteboardId="wb-2" />);

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('PersistentGuest');
      });

      unmount2();

      // Mount whiteboard 3
      renderWithProviders(<TestWhiteboardComponent whiteboardId="wb-3" />);

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('PersistentGuest');
      });

      // All three whiteboards should use the same guest name
      expect(sessionStorageMock.getItem('alkemio_guest_name')).toBe('PersistentGuest');
    });
  });

  describe('Session updates across whiteboard instances', () => {
    it('should not prompt for guest name on subsequent whiteboard if name exists', async () => {
      // User visits first whiteboard and sets name
      const { unmount } = renderWithProviders(<TestWhiteboardComponent whiteboardId="first-wb" />);

      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });

      unmount();

      // User navigates to second whiteboard
      const onGuestNameReady = vi.fn();
      renderWithProviders(<TestWhiteboardComponent whiteboardId="second-wb" onGuestNameReady={onGuestNameReady} />);

      // Should immediately have guest name, no prompt needed
      await waitFor(() => {
        expect(onGuestNameReady).toHaveBeenCalledWith('TestGuest');
      });

      expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
    });

    it('should handle session storage being cleared mid-session', async () => {
      sessionStorageMock.setItem('alkemio_guest_name', 'InitialGuest');

      const { unmount } = renderWithProviders(<TestWhiteboardComponent whiteboardId="wb-clear-test" />);

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('InitialGuest');
      });

      // Simulate session storage being cleared (e.g., by another tab or user action)
      sessionStorageMock.clear();

      unmount();

      // New whiteboard mount should not have guest name
      renderWithProviders(<TestWhiteboardComponent whiteboardId="wb-after-clear" />);

      // Should show no guest name since storage was cleared
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
      });
    });
  });

  describe('Session isolation between different contexts', () => {
    it('should share guest name across provider instances via session storage', async () => {
      sessionStorageMock.clear();

      // Render first provider and set guest name
      const { unmount: unmount1 } = renderWithProviders(<TestWhiteboardComponent whiteboardId="isolated-1" />);

      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });

      unmount1();

      // Render second provider - should load same guest name from storage
      renderWithProviders(<TestWhiteboardComponent whiteboardId="isolated-2" />);

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('TestGuest');
      });
    });
  });

  describe('Session storage availability checks', () => {
    it('should handle unavailable session storage gracefully', () => {
      // Mock session storage to throw
      const originalSessionStorage = globalThis.sessionStorage;
      Object.defineProperty(globalThis, 'sessionStorage', {
        get: () => {
          throw new Error('Session storage unavailable');
        },
        configurable: true,
      });

      if (globalThis.window !== undefined) {
        Object.defineProperty(globalThis.window, 'sessionStorage', {
          get: () => {
            throw new Error('Session storage unavailable');
          },
          configurable: true,
        });
      }

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderWithProviders(<TestWhiteboardComponent whiteboardId="storage-unavailable" />);

      // Should warn about unavailable storage
      expect(consoleWarnSpy).toHaveBeenCalledWith('Session storage unavailable:', expect.any(Error));

      // Restore
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: originalSessionStorage,
        configurable: true,
        writable: true,
      });

      if (globalThis.window !== undefined) {
        Object.defineProperty(globalThis.window, 'sessionStorage', {
          value: originalSessionStorage,
          configurable: true,
          writable: true,
        });
      }
      consoleWarnSpy.mockRestore();
    });

    it('should handle session storage quota exceeded gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock setItem to throw quota exceeded error
      const setItemSpy = vi.spyOn(sessionStorageMock, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      renderWithProviders(<TestWhiteboardComponent whiteboardId="quota-test" />);

      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to persist guest name:', expect.any(Error));
      });

      // Restore
      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Guest name updates propagate correctly', () => {
    it('should update session storage when guest name changes', async () => {
      const { rerender } = renderWithProviders(<TestWhiteboardComponent whiteboardId="update-test" />);

      // Set initial guest name
      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(sessionStorageMock.getItem('alkemio_guest_name')).toBe('TestGuest');
      });

      rerender(
        <Providers>
          <TestComponentWithGuestNameUpdate />
        </Providers>
      );

      await user.click(screen.getByText('Update Name'));

      await waitFor(() => {
        expect(sessionStorageMock.getItem('alkemio_guest_name')).toBe('UpdatedGuest');
      });
    });
  });
});
