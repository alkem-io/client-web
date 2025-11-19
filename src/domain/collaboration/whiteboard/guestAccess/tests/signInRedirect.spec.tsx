/**
 * Integration tests for sign-in redirect flow on public whiteboards
 * Tests that clicking "Sign In to Alkemio" preserves the return URL correctly
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/main/test/testUtils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import JoinWhiteboardDialog from '@/main/public/whiteboard/JoinWhiteboardDialog';
import { GuestSessionProvider } from '../context/GuestSessionContext';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('Sign-in Redirect Flow', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
  });

  const renderDialog = (pathname = '/public/whiteboard/test-whiteboard-id') => {
    return render(
      <MemoryRouter initialEntries={[pathname]}>
        <GuestSessionProvider>
          <JoinWhiteboardDialog open onSubmit={mockOnSubmit} />
        </GuestSessionProvider>
      </MemoryRouter>
    );
  };

  describe('Return URL preservation', () => {
    it('should navigate to auth page with return URL when sign-in button is clicked', async () => {
      const user = userEvent.setup();
      renderDialog('/public/whiteboard/abc123');

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Should navigate to auth-required with return URL
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/required?returnUrl='));
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/public/whiteboard/abc123'));
    });

    it('should encode return URL correctly for different whiteboard IDs', async () => {
      const user = userEvent.setup();
      const whiteboardId = 'whiteboard-with-special-chars-123';
      renderDialog(`/public/whiteboard/${whiteboardId}`);

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      const navigateCall = mockNavigate.mock.calls[0][0];
      expect(navigateCall).toContain('/required?returnUrl=');
      expect(navigateCall).toContain(whiteboardId);
    });

    it('should include full path including origin in return URL', async () => {
      const user = userEvent.setup();
      renderDialog('/public/whiteboard/test-id');

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      const navigateCall = mockNavigate.mock.calls[0][0];
      // buildReturnUrlParam includes origin by default
      expect(navigateCall).toMatch(/\/required\?returnUrl=http/);
    });
  });

  describe('Guest session cleanup', () => {
    it('should clear guest session data before navigating to sign-in', async () => {
      const user = userEvent.setup();

      // Set guest name in session
      sessionStorageMock.setItem('alkemio_guest_name', 'TestGuest');
      expect(sessionStorageMock.getItem('alkemio_guest_name')).toBe('TestGuest');

      renderDialog();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Guest session should be cleared before navigation
      expect(sessionStorageMock.getItem('alkemio_guest_name')).toBeNull();
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should preserve other session storage data when clearing guest session', async () => {
      const user = userEvent.setup();

      // Set multiple session storage items
      sessionStorageMock.setItem('alkemio_guest_name', 'TestGuest');
      sessionStorageMock.setItem('returnUrl', '/some/path');
      sessionStorageMock.setItem('other_app_data', 'preserved');

      renderDialog();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Only guest name should be cleared
      expect(sessionStorageMock.getItem('alkemio_guest_name')).toBeNull();
      expect(sessionStorageMock.getItem('returnUrl')).toBe('/some/path');
      expect(sessionStorageMock.getItem('other_app_data')).toBe('preserved');
    });
  });

  describe('Navigation flow', () => {
    it('should not call guest submission handler when signing in', async () => {
      const user = userEvent.setup();
      renderDialog();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Should navigate, not submit guest form
      expect(mockNavigate).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should navigate immediately without waiting for user input', async () => {
      const user = userEvent.setup();
      renderDialog();

      const signInButton = screen.getByRole('button', { name: /sign in/i });

      // Click sign-in button
      await user.click(signInButton);

      // Should navigate immediately
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should be able to sign in even with invalid guest name in input', async () => {
      const user = userEvent.setup();
      renderDialog();

      // Type invalid characters in guest name field
      const input = screen.getByLabelText(/guest name/i);
      await user.type(input, '@@@invalid@@@');

      // Sign-in button should still work
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle sign-in from different public whiteboard paths', async () => {
      const user = userEvent.setup();
      const paths = [
        '/public/whiteboard/simple-id',
        '/public/whiteboard/id-with-dashes',
        '/public/whiteboard/123-numeric-start',
        '/public/whiteboard/very-long-whiteboard-identifier-with-many-segments',
      ];

      for (const path of paths) {
        vi.clearAllMocks();
        const { unmount } = renderDialog(path);

        const signInButton = screen.getByRole('button', { name: /sign in/i });
        await user.click(signInButton);

        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining(path));

        unmount();
      }
    });

    it('should handle rapid clicks on sign-in button gracefully', async () => {
      const user = userEvent.setup();
      renderDialog();

      const signInButton = screen.getByRole('button', { name: /sign in/i });

      // Click multiple times rapidly
      await user.click(signInButton);
      await user.click(signInButton);
      await user.click(signInButton);

      // Should have navigated (may be called multiple times, that's OK)
      expect(mockNavigate).toHaveBeenCalled();
      // Guest session should still be cleared
      expect(sessionStorageMock.getItem('alkemio_guest_name')).toBeNull();
    });
  });

  describe('Auth flow integration', () => {
    it('should use correct auth-required path constant', async () => {
      const user = userEvent.setup();
      renderDialog();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      const navigateCall = mockNavigate.mock.calls[0][0];
      // Should use /required not /auth-required or /login
      expect(navigateCall).toMatch(/^\/required\?returnUrl=/);
    });

    it('should construct valid return URL that auth system can process', async () => {
      const user = userEvent.setup();
      renderDialog('/public/whiteboard/test-id');

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      const navigateCall = mockNavigate.mock.calls[0][0];

      // Should have proper query parameter format
      expect(navigateCall).toMatch(/\?returnUrl=/);

      // Return URL should be a valid URI
      const match = navigateCall.match(/returnUrl=([^&]+)/);
      expect(match).toBeTruthy();

      if (match) {
        const returnUrl = decodeURI(match[1]);
        expect(returnUrl).toContain('http');
        expect(returnUrl).toContain('/public/whiteboard/test-id');
      }
    });
  });
});
