import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import {
  type VcInviteItem,
  VirtualContributorInviteDialog,
  type VirtualContributorInviteDialogProps,
} from './VirtualContributorInviteDialog';

/**
 * Parity baseline for the CURRENT VirtualContributorInviteDialog (R-4, D13
 * sequence step 2), written BEFORE the VC-kind fold into the unified
 * InviteMembersDialog. Every assertion here is the checklist the fold commit
 * must keep green (ported into InviteMembersDialog.test.tsx) — if any cannot
 * be reproduced without changing VC behavior, the fold commit is dropped.
 */
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const accountVc: VcInviteItem = { id: 'vc-account-1', displayName: 'Account VC' };
const libraryVc: VcInviteItem = { id: 'vc-library-1', displayName: 'Library VC' };

const baseProps: VirtualContributorInviteDialogProps = {
  open: true,
  onOpenChange: vi.fn(),
  searchQuery: '',
  onSearchChange: vi.fn(),
  accountVcs: [accountVc],
  libraryVcs: [libraryVc],
  onAddAccountVc: vi.fn(),
  onInviteLibraryVc: vi.fn(),
};

describe('VirtualContributorInviteDialog (VC parity baseline — R-4)', () => {
  test('account VC row: clicking Add calls onAddAccountVc with its id', async () => {
    const onAddAccountVc = vi.fn();
    render(<VirtualContributorInviteDialog {...baseProps} onAddAccountVc={onAddAccountVc} />);
    await userEvent.click(screen.getByRole('button', { name: 'inviteVc.addAriaLabel:{"name":"Account VC"}' }));
    expect(onAddAccountVc).toHaveBeenCalledWith('vc-account-1');
  });

  test('library VC row: clicking Invite opens the welcome-message step, then Send calls onInviteLibraryVc(id, message)', async () => {
    const onInviteLibraryVc = vi.fn();
    render(<VirtualContributorInviteDialog {...baseProps} onInviteLibraryVc={onInviteLibraryVc} />);

    await userEvent.click(screen.getByRole('button', { name: 'inviteVc.inviteAriaLabel:{"name":"Library VC"}' }));
    // Message step: welcome-message textarea is visible, addressed to the invited VC.
    expect(screen.getByText('Library VC')).toBeInTheDocument();
    const textarea = screen.getByLabelText('inviteVc.welcomeMessageLabel');
    await userEvent.type(textarea, 'Welcome aboard');
    await userEvent.click(screen.getByRole('button', { name: 'inviteVc.sendInvite' }));

    expect(onInviteLibraryVc).toHaveBeenCalledWith('vc-library-1', 'Welcome aboard');
  });

  test('library message step: Send is disabled while the message is empty/whitespace', async () => {
    render(<VirtualContributorInviteDialog {...baseProps} />);
    await userEvent.click(screen.getByRole('button', { name: 'inviteVc.inviteAriaLabel:{"name":"Library VC"}' }));
    expect(screen.getByRole('button', { name: 'inviteVc.sendInvite' })).toBeDisabled();
  });

  test('preview sub-view: clicking a row opens onPreview(id) and renders VirtualContributorPreview data', async () => {
    const onPreview = vi.fn();
    const { rerender } = render(
      <VirtualContributorInviteDialog {...baseProps} onPreview={onPreview} previewData={undefined} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'inviteVc.previewAriaLabel:{"name":"Account VC"}' }));
    expect(onPreview).toHaveBeenCalledWith('vc-account-1');

    // Simulate the connector supplying preview data once onPreview fires.
    rerender(
      <VirtualContributorInviteDialog
        {...baseProps}
        onPreview={onPreview}
        previewData={{ id: 'vc-account-1', displayName: 'Account VC', tags: [], description: 'A VC.' }}
      />
    );
    // VirtualContributorPreview renders the VC's display name as a heading.
    expect(screen.getByRole('heading', { name: 'Account VC' })).toBeInTheDocument();
  });

  test('libraryOnly hides the account section entirely', () => {
    render(<VirtualContributorInviteDialog {...baseProps} libraryOnly={true} />);
    expect(screen.queryByText('inviteVc.onAccount')).not.toBeInTheDocument();
    expect(screen.queryByText('Account VC')).not.toBeInTheDocument();
    expect(screen.getByText('inviteVc.inLibrary')).toBeInTheDocument();
    expect(screen.getByText('Library VC')).toBeInTheDocument();
  });

  test('loading state renders a status output instead of the VC lists', () => {
    render(<VirtualContributorInviteDialog {...baseProps} loading={true} />);
    expect(screen.getByLabelText('inviteVc.loading')).toBeInTheDocument();
    expect(screen.queryByText('Account VC')).not.toBeInTheDocument();
    expect(screen.queryByText('Library VC')).not.toBeInTheDocument();
  });

  test('typing in the search box fires onSearchChange', async () => {
    const onSearchChange = vi.fn();
    render(<VirtualContributorInviteDialog {...baseProps} onSearchChange={onSearchChange} />);
    await userEvent.type(screen.getByPlaceholderText('inviteVc.searchPlaceholder'), 'a');
    expect(onSearchChange).toHaveBeenCalled();
  });
});
