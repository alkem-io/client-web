import { fireEvent, render, screen } from '@/main/test/testUtils';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { describe, expect, it, vi } from 'vitest';
import WhiteboardGuestAccessSection from '../WhiteboardGuestAccessSection';
import WhiteboardGuestAccessControls from '../WhiteboardGuestAccessControls';
import { UseWhiteboardGuestAccessResult } from '../../hooks/useWhiteboardGuestAccess';

const buildGuestAccess = (overrides: Partial<UseWhiteboardGuestAccessResult> = {}): UseWhiteboardGuestAccessResult => ({
  enabled: false,
  canToggle: true,
  isUpdating: false,
  guestLink: 'https://example.com/guest',
  hasError: false,
  onToggle: vi.fn(() => Promise.resolve()),
  resetError: vi.fn(),
  ...overrides,
});

const privilegedWhiteboard = {
  authorization: {
    myPrivileges: [AuthorizationPrivilege.PublicShare],
  },
};

describe('WhiteboardGuestAccessSection', () => {
  it('shows guest link when access is enabled', () => {
    render(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: true })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.getByRole('textbox', { name: /guest access url/i })).toBeInTheDocument();
  });

  it('hides the section when user lacks PUBLIC_SHARE privilege and guest access is disabled', () => {
    render(
      <WhiteboardGuestAccessControls whiteboard={{ authorization: { myPrivileges: [] } }}>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: true })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.queryByTestId('guest-access-section')).not.toBeInTheDocument();
  });

  it('shows guest link for non-privileged users when guest access is enabled', () => {
    render(
      <WhiteboardGuestAccessControls whiteboard={{ authorization: { myPrivileges: [] } }} guestAccessEnabled>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: true })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.getByRole('textbox', { name: /guest access url/i })).toBeInTheDocument();
  });

  it('invokes onToggle when the switch is clicked', () => {
    const guestAccess = buildGuestAccess();

    render(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={guestAccess} />
      </WhiteboardGuestAccessControls>
    );

    fireEvent.click(screen.getByRole('checkbox', { name: /guest access/i }));
    expect(guestAccess.onToggle).toHaveBeenCalledWith(true);
  });

  it('hides guest link when access is disabled', () => {
    const { rerender } = render(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: true })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.getByRole('textbox', { name: /guest access url/i })).toBeInTheDocument();

    rerender(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: false })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.queryByRole('textbox', { name: /guest access url/i })).not.toBeInTheDocument();
  });

  it('shows an error message when guest access update fails', () => {
    const guestAccess = buildGuestAccess({ hasError: true });

    render(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={guestAccess} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.getByTestId('guest-access-error')).toHaveTextContent(
      "We couldn't update guest access. Please try again."
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(guestAccess.resetError).toHaveBeenCalled();
  });
});
