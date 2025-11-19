/**
 * @vitest-environment jsdom
 * Unit tests: WhiteboardDialogFooter guest contributions warning badge
 * Spec: 001-guest-whiteboard-contributions, US6 - Guest Contributions Warning in Whiteboard Dialog
 *
 * Tests the conditional rendering of the guest contributions warning badge in the footer
 * when guestContributionsAllowed is true.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@/main/test/testUtils';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import WhiteboardDialogFooter from './WhiteboardDialogFooter';
import { ContentUpdatePolicy } from '@/core/apollo/generated/graphql-schema';

// Mock dependencies
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
    createdBy: undefined,
    contentUpdatePolicy: ContentUpdatePolicy.Admins,
    collaboratorMode: null,
    collaboratorModeReason: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (props = {}) =>
    render(
      <MemoryRouter>
        <WhiteboardDialogFooter {...defaultProps} {...props} />
      </MemoryRouter>
    );

  describe('Warning badge visibility', () => {
    it('should display warning badge when guestContributionsAllowed is true', () => {
      renderComponent({ guestContributionsAllowed: true });

      // The warning text should be visible
      const warningText = screen.getByText('This whiteboard is visible to guest users');
      expect(warningText).toBeInTheDocument();
    });

    it('should NOT display warning badge when guestContributionsAllowed is false', () => {
      renderComponent({ guestContributionsAllowed: false });

      // The warning text should NOT be visible
      const warningText = screen.queryByText('This whiteboard is visible to guest users');
      expect(warningText).not.toBeInTheDocument();
    });

    it('should NOT display warning badge when guestContributionsAllowed is undefined', () => {
      renderComponent(); // No guestContributionsAllowed prop

      // The warning text should NOT be visible
      const warningText = screen.queryByText('This whiteboard is visible to guest users');
      expect(warningText).not.toBeInTheDocument();
    });
  });

  describe('Warning badge content', () => {
    it('should display Public icon when warning is shown', () => {
      renderComponent({ guestContributionsAllowed: true });

      // Find the warning text and check for SVG (icon) in the container
      const warningText = screen.getByText('This whiteboard is visible to guest users');
      const warningContainer = warningText.closest('div');
      const publicIcon = warningContainer?.querySelector('svg');

      expect(publicIcon).toBeInTheDocument();
    });

    it('should display translated warning text', () => {
      renderComponent({ guestContributionsAllowed: true });

      // Verify the translated text is displayed
      const warningText = screen.getByText('This whiteboard is visible to guest users');
      expect(warningText).toBeInTheDocument();
    });
  });
});
