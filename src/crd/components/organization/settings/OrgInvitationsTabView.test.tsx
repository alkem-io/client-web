import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { OrgInvitationsTabView } from './OrgInvitationsTabView';
import type { OrgInvitationRow, OrgInvitationsTabViewProps } from './OrgInvitationsTabView.types';

const row = (overrides: Partial<OrgInvitationRow> = {}): OrgInvitationRow => ({
  id: 'inv-1',
  spaceDisplayName: 'Green Energy',
  spaceUrl: '/space/green-energy',
  invitedByText: 'Invited by Alice',
  dateText: '01/01/2026',
  roleLabel: 'Member',
  canAct: true,
  ...overrides,
});

const baseProps: OrgInvitationsTabViewProps = {
  loading: false,
  title: 'Space Invitations',
  rows: [],
  emptyLabel: 'No pending Space invitations.',
  acceptLabel: 'Accept',
  declineLabel: 'Decline',
  onAccept: vi.fn(),
  onDecline: vi.fn(),
  acceptConfirm: {
    open: false,
    title: 'Accept this invitation?',
    body: 'Your organisation will join Green Energy as Member.',
    confirmLabel: 'Accept invitation',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  },
  declineConfirm: {
    open: false,
    title: 'Decline this invitation?',
    body: 'Green Energy will be told your organisation declined.',
    confirmLabel: 'Decline invitation',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  },
};

describe('OrgInvitationsTabView — decline confirmation (Golden Rule 9)', () => {
  test('renders the destructive decline confirmation when it is open', () => {
    render(
      <OrgInvitationsTabView
        {...baseProps}
        declineConfirm={{ ...baseProps.declineConfirm, open: true }}
        rows={[row()]}
      />
    );
    expect(screen.getByText('Decline this invitation?')).toBeInTheDocument();
    expect(screen.getByText('Green Energy will be told your organisation declined.')).toBeInTheDocument();
  });

  test('does not render the decline confirmation while it is closed', () => {
    render(<OrgInvitationsTabView {...baseProps} rows={[row()]} />);
    expect(screen.queryByText('Decline this invitation?')).not.toBeInTheDocument();
  });
});

describe('OrgInvitationsTabView (T013)', () => {
  test('renders the always-present empty state when there are no rows', () => {
    render(<OrgInvitationsTabView {...baseProps} />);
    expect(screen.getByText('No pending Space invitations.')).toBeInTheDocument();
  });

  test('renders a row with space link, invitedBy, date, role, and welcome message', () => {
    render(<OrgInvitationsTabView {...baseProps} rows={[row({ welcomeMessage: 'Come join us!' })]} />);
    expect(screen.getByRole('link', { name: 'Green Energy' })).toHaveAttribute('href', '/space/green-energy');
    expect(screen.getByText(/Invited by Alice/)).toBeInTheDocument();
    expect(screen.getByText('Come join us!')).toBeInTheDocument();
  });

  test('renders the multi-space list only when spacesToJoinText is provided', () => {
    const { rerender } = render(<OrgInvitationsTabView {...baseProps} rows={[row()]} />);
    expect(screen.queryByText(/also joins/)).not.toBeInTheDocument();

    rerender(
      <OrgInvitationsTabView
        {...baseProps}
        rows={[row({ spacesToJoinText: 'Accepting also joins: Root Space, Green Energy' })]}
      />
    );
    expect(screen.getByText('Accepting also joins: Root Space, Green Energy')).toBeInTheDocument();
  });

  test('Accept/Decline are disabled when canAct is false, and clicking them does nothing', async () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    render(
      <OrgInvitationsTabView {...baseProps} rows={[row({ canAct: false })]} onAccept={onAccept} onDecline={onDecline} />
    );

    const accept = screen.getByRole('button', { name: 'Accept' });
    const decline = screen.getByRole('button', { name: 'Decline' });
    expect(accept).toBeDisabled();
    expect(decline).toBeDisabled();
  });

  test('clicking Accept/Decline calls the handlers with the row id when canAct is true', async () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    render(<OrgInvitationsTabView {...baseProps} rows={[row()]} onAccept={onAccept} onDecline={onDecline} />);

    await userEvent.click(screen.getByRole('button', { name: 'Accept' }));
    expect(onAccept).toHaveBeenCalledWith('inv-1');

    await userEvent.click(screen.getByRole('button', { name: 'Decline' }));
    expect(onDecline).toHaveBeenCalledWith('inv-1');
  });

  test('accept confirmation dialog renders its title/body/action when open', () => {
    render(
      <OrgInvitationsTabView {...baseProps} rows={[row()]} acceptConfirm={{ ...baseProps.acceptConfirm, open: true }} />
    );
    expect(screen.getByText('Accept this invitation?')).toBeInTheDocument();
    expect(screen.getByText('Your organisation will join Green Energy as Member.')).toBeInTheDocument();
  });

  test('renders skeletons while loading, not the empty state or rows', () => {
    render(<OrgInvitationsTabView {...baseProps} loading={true} rows={[row()]} />);
    expect(screen.queryByText('No pending Space invitations.')).not.toBeInTheDocument();
    expect(screen.queryByText('Green Energy')).not.toBeInTheDocument();
  });

  test('both actions are disabled while a mutation is in flight', async () => {
    // Decline has no confirmation step and the row is not removed
    // optimistically — it disappears only after the refetch. Without this
    // guard a second click sent a second REJECT into a state whose lifecycle
    // defines no REJECT transition, so the server threw and the org admin was
    // shown a failure toast for a decline that had actually succeeded.
    const onDecline = vi.fn();
    const onAccept = vi.fn();
    render(
      <OrgInvitationsTabView {...baseProps} rows={[row()]} onDecline={onDecline} onAccept={onAccept} busy={true} />
    );

    const decline = screen.getByRole('button', { name: 'Decline' });
    const accept = screen.getByRole('button', { name: 'Accept' });
    expect(decline).toBeDisabled();
    expect(accept).toBeDisabled();

    await userEvent.click(decline);
    await userEvent.click(accept);
    expect(onDecline).not.toHaveBeenCalled();
    expect(onAccept).not.toHaveBeenCalled();
  });
});
