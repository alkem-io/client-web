import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { type InvitationResult, InviteMembersDialog, type InviteMembersDialogLabels } from './InviteMembersDialog';

const labels: InviteMembersDialogLabels = {
  title: 'Invite to TestSpace',
  searchHint: 'Search hint',
  searchPlaceholder: 'Username or email…',
  searchAriaLabel: 'Search users',
  noResultsLabel: 'No matching users',
  loadingLabel: 'Loading…',
  loadMoreLabel: 'Loading more…',
  removeAriaLabel: (label: string) => `Remove ${label}`,
  validationErrorLabel: kind => (kind === 'invalid' ? 'Invalid email' : 'Duplicate email'),
  welcomeMessageLabel: 'Invitation message',
  welcomeMessagePlaceholder: 'Write…',
  emailVisibilityNote: 'Visibility note',
  inviteToRoleLabel: 'Invite to be a:',
  rolePopoverHelper: 'Member is always granted',
  rolePopoverAriaLabel: 'Choose roles',
  roleLabels: { Member: 'Member', Lead: 'Lead', Admin: 'Admin' },
  sendButtonLabel: 'Send',
  sendingButtonLabel: 'Sending…',
  backButtonLabel: 'Back',
  closeButtonLabel: 'Close',
  closeAriaLabel: 'Close dialog',
  resultOutcomeLabels: {
    sent: 'Sent',
    alreadyInvited: 'Already invited',
    alreadyMember: 'Already a member',
    alreadyHasApplication: 'Already has an open application',
    parentNotAuthorized: "Can't invite to parent",
    error: 'Failed',
  },
};

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  spaceName: 'TestSpace',
  selectedContributors: [],
  searchResults: [],
  searchQuery: '',
  onSearchChange: vi.fn(),
  onSelectUser: vi.fn(),
  onRemoveContributor: vi.fn(),
  welcomeMessage: 'Hi, please join TestSpace.',
  onWelcomeMessageChange: vi.fn(),
  extraRoles: ['Member'] as const,
  onExtraRolesChange: vi.fn(),
  onSend: vi.fn(),
  onBack: vi.fn(),
  labels,
};

describe('InviteMembersDialog', () => {
  test('Send disabled when no contributors selected', () => {
    render(<InviteMembersDialog {...baseProps} extraRoles={['Member']} />);
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  test('Send disabled when welcomeMessage is whitespace', () => {
    render(
      <InviteMembersDialog
        {...baseProps}
        selectedContributors={[{ kind: 'user', userId: 'u1', displayName: 'Alice' }]}
        welcomeMessage="   "
        extraRoles={['Member']}
      />
    );
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  test('Send disabled when any chip has a validation error', () => {
    render(
      <InviteMembersDialog
        {...baseProps}
        selectedContributors={[
          { kind: 'user', userId: 'u1', displayName: 'Alice' },
          { kind: 'email', email: 'broken@', validationError: 'invalid' },
        ]}
        extraRoles={['Member']}
      />
    );
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  test('Send enabled with valid chip, message, and Member role', () => {
    render(
      <InviteMembersDialog
        {...baseProps}
        selectedContributors={[{ kind: 'user', userId: 'u1', displayName: 'Alice' }]}
        extraRoles={['Member']}
      />
    );
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
  });

  test('Send shows sending label and aria-busy while in flight', () => {
    render(
      <InviteMembersDialog
        {...baseProps}
        selectedContributors={[{ kind: 'user', userId: 'u1', displayName: 'Alice' }]}
        extraRoles={['Member']}
        sending={true}
      />
    );
    const sendButton = screen.getByRole('button', { name: 'Sending…' });
    expect(sendButton).toBeDisabled();
    expect(sendButton).toHaveAttribute('aria-busy', 'true');
  });

  test('Form view renders welcome message textarea', () => {
    render(<InviteMembersDialog {...baseProps} extraRoles={['Member']} />);
    expect(screen.getByLabelText('Invitation message')).toBeInTheDocument();
  });

  test('When `results` is provided, dialog auto-switches to result view', () => {
    const results: InvitationResult[] = [
      { invitee: { kind: 'user', userId: 'u1', displayName: 'Alice' }, outcome: 'sent' },
      { invitee: { kind: 'email', email: 'bob@example.com' }, outcome: 'alreadyInvited' },
    ];
    render(<InviteMembersDialog {...baseProps} extraRoles={['Member']} results={results} />);
    // Result view: Back + Close buttons appear, Send button does not.
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument();
    // Each invitee renders with its outcome label.
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('Already invited')).toBeInTheDocument();
  });

  test('Back button calls onBack and does not call welcome/role change handlers (preserves them)', async () => {
    const onBack = vi.fn();
    const onWelcomeMessageChange = vi.fn();
    const onExtraRolesChange = vi.fn();
    const results: InvitationResult[] = [
      { invitee: { kind: 'user', userId: 'u1', displayName: 'Alice' }, outcome: 'sent' },
    ];
    render(
      <InviteMembersDialog
        {...baseProps}
        extraRoles={['Member']}
        results={results}
        onBack={onBack}
        onWelcomeMessageChange={onWelcomeMessageChange}
        onExtraRolesChange={onExtraRolesChange}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
    expect(onWelcomeMessageChange).not.toHaveBeenCalled();
    expect(onExtraRolesChange).not.toHaveBeenCalled();
  });
});
