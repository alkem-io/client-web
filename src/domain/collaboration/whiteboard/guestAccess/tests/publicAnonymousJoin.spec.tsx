/**
 * Integration tests for anonymous guest join flow on public whiteboards
 * Tests the JoinWhiteboardDialog component's validation, submission, and error handling
 *
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

describe('PublicWhiteboardPage - Anonymous Join Flow', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
  });

  const renderDialog = () => {
    return render(
      <MemoryRouter initialEntries={['/public/whiteboard/test-id']}>
        <GuestSessionProvider>
          <JoinWhiteboardDialog open onSubmit={mockOnSubmit} />
        </GuestSessionProvider>
      </MemoryRouter>
    );
  };

  describe('Basic rendering', () => {
    it('should render join dialog with all required elements', () => {
      renderDialog();

      expect(screen.getByText(/join whiteboard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/guest name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should disable join button when input is empty', () => {
      renderDialog();

      const joinButton = screen.getByRole('button', { name: /join/i });
      expect(joinButton).toBeDisabled();
    });

    it('should enable join button when valid name is entered', async () => {
      const user = userEvent.setup();
      renderDialog();

      const input = screen.getByLabelText(/guest name/i);
      const joinButton = screen.getByRole('button', { name: /join/i });

      await user.type(input, 'ValidGuest');

      await waitFor(() => {
        expect(joinButton).not.toBeDisabled();
      });
    });
  });

  describe('Form submission with valid input', () => {
    it('should call onSubmit with valid guest name', async () => {
      const user = userEvent.setup();
      renderDialog();

      const input = screen.getByLabelText(/guest name/i);

      await user.type(input, 'TestGuest');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('TestGuest');
      });
    });

    it('should trim whitespace from guest name', async () => {
      const user = userEvent.setup();
      renderDialog();

      const input = screen.getByLabelText(/guest name/i);

      await user.type(input, '  GuestName  ');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('GuestName');
      });
    });
  });

  describe('Form validation', () => {
    it('should show error for invalid characters', async () => {
      const user = userEvent.setup();
      renderDialog();

      const input = screen.getByLabelText(/guest name/i);

      await user.type(input, 'Test@User!');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/letters, numbers, hyphens/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for names exceeding 50 characters', async () => {
      const user = userEvent.setup();
      renderDialog();

      const input = screen.getByLabelText(/guest name/i);
      const longName = 'a'.repeat(51);

      await user.type(input, longName);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/50 characters/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Error recovery', () => {
    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      renderDialog();

      const input = screen.getByLabelText(/guest name/i);

      // Trigger error
      await user.type(input, '@@@');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/letters, numbers, hyphens/i)).toBeInTheDocument();
      });

      // Error should clear when typing
      await user.clear(input);
      await user.type(input, 'V');

      await waitFor(() => {
        expect(screen.queryByText(/letters, numbers, hyphens/i)).not.toBeInTheDocument();
      });
    });

    it('should allow resubmission after fixing error', async () => {
      const user = userEvent.setup();
      renderDialog();

      const input = screen.getByLabelText(/guest name/i);

      // First attempt with invalid name
      await user.type(input, '@@@');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/letters, numbers, hyphens/i)).toBeInTheDocument();
      });

      // Fix and resubmit
      await user.clear(input);
      await user.type(input, 'ValidName');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('ValidName');
      });
    });
  });

  describe('Alternative actions', () => {
    it('should navigate to sign-in when sign-in button is clicked', async () => {
      const user = userEvent.setup();
      renderDialog();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/required?returnUrl=')
      );
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear guest session data when navigating to sign-in', async () => {
      const user = userEvent.setup();

      // Set a guest name in session storage
      sessionStorageMock.setItem('alkemio_guest_name', 'ExistingGuest');
      expect(sessionStorageMock.getItem('alkemio_guest_name')).toBe('ExistingGuest');

      renderDialog();

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Guest session should be cleared
      expect(sessionStorageMock.getItem('alkemio_guest_name')).toBeNull();
    });
  });
});
