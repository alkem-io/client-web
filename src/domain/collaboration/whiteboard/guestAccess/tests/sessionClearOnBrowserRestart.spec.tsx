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
import { FC, PropsWithChildren, ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import RootThemeProvider from '@/core/ui/themes/RootThemeProvider';
import i18n from '@/core/i18n/config';
import { I18nextProvider } from 'react-i18next';
import userEvent from '@testing-library/user-event';
import {
  SessionStorageMock,
  createSessionStorageMockInstance,
  setSessionStorageImplementation,
} from './utils/sessionStorageMock';

// Mock the Sentry logging module
const mockLogWarn = vi.fn();
vi.mock('@/core/logging/sentry/log', () => ({
  warn: (message: string, options?: unknown) => mockLogWarn(message, options),
  TagCategoryValues: { AUTH: 'auth' },
}));

type BrowserTabSession = {
  storage: SessionStorageMock;
  activate: () => void;
};

let activeSessionStorage: SessionStorageMock | null = null;

const setActiveSessionStorage = (storage: SessionStorageMock) => {
  activeSessionStorage = storage;
  setSessionStorageImplementation(storage);
};

const createBrowserTabSession = (): BrowserTabSession => {
  const storage = createSessionStorageMockInstance();
  return {
    storage,
    activate: () => setActiveSessionStorage(storage),
  };
};

const startBrowserSession = (): BrowserTabSession => {
  const session = createBrowserTabSession();
  session.activate();
  return session;
};

const getActiveSessionStorage = (): SessionStorageMock => {
  if (!activeSessionStorage) {
    startBrowserSession();
  }

  return activeSessionStorage as SessionStorageMock;
};

const simulateBrowserRestart = () => startBrowserSession();

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

const renderInTab = (tab: BrowserTabSession, whiteboardId: string) => {
  tab.activate();
  return renderWithProviders(<TestWhiteboardComponent whiteboardId={whiteboardId} />);
};

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
    cleanup();
    vi.clearAllMocks();
    mockLogWarn.mockClear();
    startBrowserSession();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    getActiveSessionStorage().clear();
  });

  describe('Browser session lifecycle', () => {
    it('should start with no guest name on fresh browser session', () => {
      renderWithProviders(<TestWhiteboardComponent whiteboardId="fresh-session" />);

      // Should have no guest name
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
      expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
    });

    it('should clear guest name when session storage is cleared (simulating browser restart)', async () => {
      // Set up an existing session
      sessionStorage.setItem('alkemio_guest_name', 'ExistingSessionGuest');

      const { unmount } = renderWithProviders(<TestWhiteboardComponent whiteboardId="session-1" />);

      // Should load existing guest name
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('ExistingSessionGuest');
      });

      unmount();

      // Simulate browser restart - allocate a brand new session storage
      simulateBrowserRestart();

      // Render new session
      renderWithProviders(<TestWhiteboardComponent whiteboardId="session-2" />);

      // Should have no guest name after restart
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
      expect(sessionStorage.getItem('alkemio_guest_name')).toBeNull();
    });

    it('should require new guest name entry after browser restart', async () => {
      // Original session
      renderWithProviders(<TestWhiteboardComponent whiteboardId="original-session" />);

      // Set guest name
      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('SessionGuest');
      });

      cleanup();

      // Simulate browser restart with new session storage instance
      simulateBrowserRestart();

      // New browser session
      renderWithProviders(<TestWhiteboardComponent whiteboardId="new-browser-session" />);

      // Should not have previous session's guest name
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');

      // User must set guest name again
      await user.click(screen.getByText('Set Guest Name'));

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

      renderWithProviders(<TestWhiteboardComponent whiteboardId="storage-type-test" />);

      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('SessionGuest');
      });

      // Should NOT be in localStorage
      expect(localStorage.getItem('alkemio_guest_name')).toBeNull();
    });

    it('should persist within same session across page reloads', async () => {
      // Set guest name in session
      renderWithProviders(<TestWhiteboardComponent whiteboardId="reload-test-1" />);

      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('SessionGuest');
      });

      cleanup();

      // Simulate page reload (session storage persists)
      // sessionStorage is NOT cleared (simulating same browser session)

      renderWithProviders(<TestWhiteboardComponent whiteboardId="reload-test-2" />);

      // Guest name should still be there
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('SessionGuest');
      });
    });

    it('should isolate guest names per browser tab within same session', async () => {
      const user = userEvent.setup();

      const tab1 = createBrowserTabSession();
      const { unmount: closeTab1 } = renderInTab(tab1, 'tab-1');

      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(tab1.storage.getItem('alkemio_guest_name')).toBe('SessionGuest');
      });

      closeTab1();

      const tab2 = createBrowserTabSession();
      const { unmount: closeTab2 } = renderInTab(tab2, 'tab-2');

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
      });
      expect(tab2.storage.getItem('alkemio_guest_name')).toBeNull();

      closeTab2();

      const { unmount: closeTab1Return } = renderInTab(tab1, 'tab-1-return');

      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('SessionGuest');
      });

      closeTab1Return();
    });
  });

  describe('Session vs persistent storage distinction', () => {
    it('should demonstrate difference between session and local storage', async () => {
      // Set something in localStorage (persistent)
      localStorage.setItem('persistent_data', 'persists-across-sessions');

      // Set guest name in sessionStorage
      renderWithProviders(<TestWhiteboardComponent whiteboardId="storage-comparison" />);

      const user = userEvent.setup();
      await user.click(screen.getByText('Set Guest Name'));

      await waitFor(() => {
        expect(sessionStorage.getItem('alkemio_guest_name')).toBe('SessionGuest');
      });

      cleanup();

      // Simulate browser restart - allocate new session storage while localStorage persists
      simulateBrowserRestart();
      // localStorage is NOT cleared (would persist in real browser)

      renderWithProviders(<TestWhiteboardComponent whiteboardId="after-restart" />);

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

      // Simulate browser close by starting a new session without copying previous data
      simulateBrowserRestart();

      // New browser session
      renderWithProviders(<TestWhiteboardComponent whiteboardId="new-browser-instance" />);

      // Guest name should be gone
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle corrupted session storage data gracefully', () => {
      // Set invalid/empty data
      sessionStorage.setItem('alkemio_guest_name', ''); // empty string

      renderWithProviders(<TestWhiteboardComponent whiteboardId="corrupted-data" />);

      // Empty string is treated as no guest name (falsy)
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');
    });

    it('should handle session storage disabled/unavailable', () => {
      // Mock sessionStorage.getItem to throw
      const storage = getActiveSessionStorage();
      const getItemSpy = vi.spyOn(storage, 'getItem').mockImplementation(() => {
        throw new Error('Session storage unavailable');
      });

      renderWithProviders(<TestWhiteboardComponent whiteboardId="storage-unavailable" />);

      // Should warn about unavailable storage via Sentry logging
      expect(mockLogWarn).toHaveBeenCalledWith(
        expect.stringContaining('Session storage unavailable'),
        expect.objectContaining({ category: 'auth' })
      );

      // Should gracefully handle and show no guest name
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');

      // Restore
      getItemSpy.mockRestore();
    });

    it('should start fresh if session storage fails to read', () => {
      // Mock to throw on getItem but succeed on setItem
      const storage = getActiveSessionStorage();
      const originalGetItem = storage.getItem;
      let getItemCallCount = 0;
      const getItemSpy = vi.spyOn(storage, 'getItem').mockImplementation(key => {
        getItemCallCount++;
        if (getItemCallCount === 1) {
          throw new Error('Read failed');
        }
        return originalGetItem.call(storage, key);
      });

      renderWithProviders(<TestWhiteboardComponent whiteboardId="read-failure" />);

      // Should start with no guest name despite read failure
      expect(screen.getByTestId('guest-name')).toHaveTextContent('No guest name');

      // Restore
      getItemSpy.mockRestore();
    });
  });
});
