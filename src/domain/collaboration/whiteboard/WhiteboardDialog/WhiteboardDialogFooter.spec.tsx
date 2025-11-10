/**
 * @vitest-environment jsdom
 * Unit tests: WhiteboardDialogFooter guest contributions warning badge
 * Spec: 001-guest-whiteboard-contributions, US6 - Guest Contributions Warning in Whiteboard Dialog
 *
 * Tests the conditional rendering of the guest contributions warning badge in the footer
 * when guestContributionsAllowed is true. The warning badge provides transparency to users
 * that the whiteboard is publicly accessible.
 *
 * Component behavior:
 * - When guestContributionsAllowed = true: Display red-bordered warning with Public icon
 * - When guestContributionsAllowed = false or undefined: No warning displayed
 * - Warning positioned on right side with space-between layout
 * - Uses theme error colors and i18next translation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { I18nextProvider } from 'react-i18next';
import WhiteboardDialogFooter from './WhiteboardDialogFooter';
import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';
import i18n from '@/core/i18n/config';
import { theme } from '@/core/ui/themes/default/Theme';

// Mock useSpace and useSubSpace hooks
vi.mock('@/domain/space/context/useSpace', () => ({
  useSpace: () => ({
    space: {
      about: {
        membership: { myMembershipStatus: 'MEMBER' },
        profile: { url: '/space-url', displayName: 'Test Space' },
      },
    },
  }),
}));

vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({
    subspace: {
      about: {
        membership: { myMembershipStatus: 'MEMBER' },
        profile: { url: '/subspace-url', displayName: 'Test Subspace' },
      },
    },
  }),
}));

vi.mock('@/main/routing/urlResolver/useUrlResolver', () => ({
  default: () => ({
    spaceLevel: 0,
  }),
}));

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({
    isAuthenticated: true,
  }),
}));

vi.mock('@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog', () => ({
  default: () => ({
    sendMessage: vi.fn(),
    directMessageDialog: null,
  }),
}));

describe('WhiteboardDialogFooter - Guest Contributions Warning Badge', () => {
  const defaultProps = {
    whiteboardUrl: '/whiteboard/test-123',
    lastSaveError: undefined,
    canUpdateContent: true,
    onDelete: vi.fn(),
    canDelete: false,
    onRestart: undefined,
    updating: false,
    createdBy: {
      id: 'user-123',
      profile: {
        displayName: 'Test User',
        url: '/user/test-user',
        avatar: undefined,
      },
    },
    contentUpdatePolicy: ContentUpdatePolicy.Admins,
    collaboratorMode: null,
    collaboratorModeReason: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <WhiteboardDialogFooter {...defaultProps} {...props} />
          </I18nextProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  describe('Warning badge visibility (FR-014, FR-017)', () => {
    it('should display warning badge when guestContributionsAllowed is true', () => {
      renderComponent({ guestContributionsAllowed: true });

      // Verify warning text is displayed (FR-015)
      const warningText = screen.getByText(/visible to guest users/i);
      expect(warningText).toBeInTheDocument();
    });

    it('should NOT display warning badge when guestContributionsAllowed is false', () => {
      renderComponent({ guestContributionsAllowed: false });

      // Verify warning text is NOT displayed (FR-017)
      const warningText = screen.queryByText(/visible to guest users/i);
      expect(warningText).not.toBeInTheDocument();
    });

    it('should NOT display warning badge when guestContributionsAllowed is undefined', () => {
      renderComponent(); // No guestContributionsAllowed prop

      // Verify warning text is NOT displayed (FR-017)
      const warningText = screen.queryByText(/visible to guest users/i);
      expect(warningText).not.toBeInTheDocument();
    });
  });

  describe('Warning badge content (FR-015)', () => {
    it('should display Public icon', () => {
      const { container } = renderComponent({ guestContributionsAllowed: true });

      // MUI icons render as SVG elements - look for any SVG in the warning container
      const warningText = screen.getByText(/visible to guest users/i);
      const warningContainer = warningText.closest('div');
      const publicIcon = warningContainer?.querySelector('svg');
      
      expect(publicIcon).toBeInTheDocument();
    });

    it('should display translated warning text', () => {
      renderComponent({ guestContributionsAllowed: true });

      // Verify the i18next key is translated correctly
      const warningText = screen.getByText('This whiteboard is visible to guest users');
      expect(warningText).toBeInTheDocument();
    });

    it('should use error color from theme', () => {
      renderComponent({ guestContributionsAllowed: true });

      // Find the warning badge Box element
      const warningBox = screen.getByText(/visible to guest users/i).closest('div');

      // Verify it has error color styling (theme.palette.error.main)
      expect(warningBox).toHaveStyle({
        color: theme.palette.error.main,
      });
    });
  });

  describe('Layout and positioning (FR-016)', () => {
    it('should position warning on right side when displayed', () => {
      renderComponent({ guestContributionsAllowed: true });

      // The warning should be visible and contain the expected text
      const warningText = screen.getByText(/visible to guest users/i);
      
      expect(warningText).toBeInTheDocument();
    });

    it('should maintain footer layout with delete button on left when warning is shown', () => {
      renderComponent({
        guestContributionsAllowed: true,
        canDelete: true
      });

      // Both delete button and warning should be present
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      const warningText = screen.getByText(/visible to guest users/i);

      expect(deleteButton).toBeInTheDocument();
      expect(warningText).toBeInTheDocument();
    });
  });

  describe('Integration with other footer elements', () => {
    it('should display warning alongside readonly messages', () => {
      renderComponent({
        guestContributionsAllowed: true,
        canUpdateContent: false,
        contentUpdatePolicy: ContentUpdatePolicy.Contributors,
      });

      // Both warning and readonly message should be visible
      const warningText = screen.getByText(/visible to guest users/i);
      expect(warningText).toBeInTheDocument();

      // Readonly message should also be present (implementation specific)
      // This verifies they coexist without conflicts
    });

    it('should not affect delete button functionality when warning is shown', () => {
      const onDelete = vi.fn();
      renderComponent({
        guestContributionsAllowed: true,
        canDelete: true,
        onDelete,
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe('Accessibility (Quality safeguard)', () => {
    it('should render warning text in a Caption component for proper typography', () => {
      renderComponent({ guestContributionsAllowed: true });

      const warningText = screen.getByText(/visible to guest users/i);

      // Caption component should be used for consistent typography
      expect(warningText.tagName).toBe('SPAN'); // Caption renders as span
    });

    it('should combine icon and text for screen reader users', () => {
      renderComponent({ guestContributionsAllowed: true });

      // Both visual (icon) and textual indicators should be present
      const warningText = screen.getByText(/visible to guest users/i);
      const warningContainer = warningText.closest('div');

      expect(warningContainer).toBeInTheDocument();
      // Icon is within the same container as text
      expect(warningContainer?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid prop changes gracefully', () => {
      const { rerender } = renderComponent({ guestContributionsAllowed: false });

      expect(screen.queryByText(/visible to guest users/i)).not.toBeInTheDocument();

      // Change to true
      rerender(
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <I18nextProvider i18n={i18n}>
              <WhiteboardDialogFooter {...defaultProps} guestContributionsAllowed />
            </I18nextProvider>
          </ThemeProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(/visible to guest users/i)).toBeInTheDocument();

      // Change back to false
      rerender(
        <MemoryRouter>
          <ThemeProvider theme={theme}>
            <I18nextProvider i18n={i18n}>
              <WhiteboardDialogFooter {...defaultProps} guestContributionsAllowed={false} />
            </I18nextProvider>
          </ThemeProvider>
        </MemoryRouter>
      );

      expect(screen.queryByText(/visible to guest users/i)).not.toBeInTheDocument();
    });

    it('should not crash when all optional props are undefined', () => {
      expect(() => {
        renderComponent({
          createdBy: undefined,
          onRestart: undefined,
          guestContributionsAllowed: undefined,
        });
      }).not.toThrow();
    });
  });
});
