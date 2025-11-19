import { fireEvent, render, screen } from '@/main/test/testUtils';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { describe, expect, it, vi } from 'vitest';
import WhiteboardGuestAccessSection from '../WhiteboardGuestAccessSection';
import WhiteboardGuestAccessControls from '../WhiteboardGuestAccessControls';
import { UseWhiteboardGuestAccessResult } from '../../hooks/useWhiteboardGuestAccess';

const buildGuestAccess = (overrides: Partial<UseWhiteboardGuestAccessResult> = {}): UseWhiteboardGuestAccessResult => ({
  enabled: false,
  canToggle: true,
  isMutating: false,
  guestLink: 'https://example.com/guest',
  error: undefined,
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
  it('shows guest link and warning when access is enabled', () => {
    render(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: true })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.getByRole('textbox', { name: /guest link/i })).toBeInTheDocument();
    expect(screen.getByText('Guests can edit this whiteboard')).toBeInTheDocument();
  });

  it('hides the section when user lacks PUBLIC_SHARE privilege', () => {
    render(
      <WhiteboardGuestAccessControls whiteboard={{ authorization: { myPrivileges: [] } }}>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: true })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.queryByTestId('guest-access-section')).not.toBeInTheDocument();
  });

  it('invokes onToggle when the switch is clicked', () => {
    const guestAccess = buildGuestAccess();

    render(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={guestAccess} />
      </WhiteboardGuestAccessControls>
    );

    fireEvent.click(screen.getByRole('checkbox', { name: /allow guest contributions/i }));
    expect(guestAccess.onToggle).toHaveBeenCalledWith(true);
  });

  it('removes guest warning and link when disabled', () => {
    const { rerender } = render(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: true })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.getByText('Guests can edit this whiteboard')).toBeInTheDocument();

    rerender(
      <WhiteboardGuestAccessControls whiteboard={privilegedWhiteboard}>
        <WhiteboardGuestAccessSection guestAccess={buildGuestAccess({ enabled: false })} />
      </WhiteboardGuestAccessControls>
    );

    expect(screen.queryByText('Guests can edit this whiteboard')).not.toBeInTheDocument();
  });
});
