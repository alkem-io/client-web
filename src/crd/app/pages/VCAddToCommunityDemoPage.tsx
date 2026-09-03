import { useState } from 'react';
import { InviteMembersDialog } from '@/crd/components/community/InviteMembersDialog';
import type { VcPreviewData } from '@/crd/components/virtualContributor/community/VirtualContributorPreview.types';
import { Button } from '@/crd/primitives/button';
import { MOCK_ACCOUNT_VCS, MOCK_LIBRARY_VCS, MOCK_VC_PREVIEWS } from '../data/virtualContributors';

/**
 * Demo: add an existing Virtual Contributor to a community. Opens the
 * virtualContributor kind of `InviteMembersDialog` (folded in from the former
 * standalone `VirtualContributorInviteDialog`, T019), which routes a selected
 * VC through the `VirtualContributorPreview` detail step before the (no-op)
 * add/invite. The search field and preview fetch are simulated against mock data.
 */
export function VCAddToCommunityDemoPage() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewData, setPreviewData] = useState<VcPreviewData | undefined>(undefined);
  const [previewLoading, setPreviewLoading] = useState(false);

  const matches = (name: string) => name.toLowerCase().includes(searchQuery.trim().toLowerCase());
  const accountVcs = MOCK_ACCOUNT_VCS.filter(vc => matches(vc.displayName));
  const libraryVcs = MOCK_LIBRARY_VCS.filter(vc => matches(vc.displayName));

  const loadPreview = (id: string) => {
    setPreviewData(undefined);
    setPreviewLoading(true);
    setTimeout(() => {
      setPreviewData(MOCK_VC_PREVIEWS[id]);
      setPreviewLoading(false);
    }, 500);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-page-title">Add a Virtual Contributor</h1>
      <p className="text-body text-muted-foreground">
        Open the invite dialog, search, select a Virtual Contributor to preview it, then add (account) or invite
        (library).
      </p>
      <Button type="button" className="self-start" onClick={() => setOpen(true)}>
        Add Virtual Contributor
      </Button>

      <InviteMembersDialog
        open={open}
        onOpenChange={setOpen}
        kind="virtualContributor"
        spaceName=""
        selectedContributors={[]}
        searchResults={[]}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectUser={() => {}}
        onRemoveContributor={() => {}}
        welcomeMessage=""
        onWelcomeMessageChange={() => {}}
        extraRoles={['Member']}
        onExtraRolesChange={() => {}}
        onSend={() => {}}
        onBack={() => {}}
        labels={{
          title: 'Invite Virtual Contributor',
          searchHint: 'Add a Virtual Contributor from your account, or invite one from the Alkemio library.',
          searchPlaceholder: '',
          searchAriaLabel: '',
          noResultsLabel: '',
          loadingLabel: '',
          loadMoreLabel: '',
          removeAriaLabel: () => '',
          validationErrorLabel: () => '',
          welcomeMessageLabel: '',
          welcomeMessagePlaceholder: '',
          emailVisibilityNote: '',
          inviteToRoleLabel: '',
          rolePopoverHelper: '',
          rolePopoverAriaLabel: '',
          roleLabels: { Member: 'Member', Lead: 'Lead', Admin: 'Admin' },
          sendButtonLabel: '',
          sendingButtonLabel: '',
          backButtonLabel: '',
          closeButtonLabel: 'Close',
          closeAriaLabel: 'Close invite dialog',
          resultOutcomeLabels: {
            sent: '',
            alreadyInvited: '',
            alreadyMember: '',
            alreadyHasApplication: '',
            parentNotAuthorized: '',
            notAcceptingInvitations: '',
            leadLimitReached: '',
            error: '',
          },
        }}
        vcAccountItems={accountVcs}
        vcLibraryItems={libraryVcs}
        onAddAccountVc={id => {
          console.log('Demo: add account VC', id);
          setOpen(false);
        }}
        onInviteLibraryVc={(id, message) => {
          console.log('Demo: invite library VC', id, message);
          setOpen(false);
        }}
        vcPreviewData={previewData}
        vcPreviewLoading={previewLoading}
        onPreviewVc={loadPreview}
        onClosePreviewVc={() => {
          setPreviewData(undefined);
          setPreviewLoading(false);
        }}
        vcLabels={{
          searchPlaceholder: 'Search virtual contributors…',
          loading: 'Loading virtual contributors',
          onAccount: 'On your account',
          onAccountEmpty: 'No virtual contributors available on your account.',
          inLibrary: 'In the library',
          inLibraryEmpty: 'No library virtual contributors match your search.',
          add: 'Add',
          invite: 'Invite',
          addAriaLabel: name => `Add ${name}`,
          inviteAriaLabel: name => `Invite ${name}`,
          previewAriaLabel: name => `Preview ${name}`,
          back: 'Back',
          welcomeMessageLabel: 'Welcome message',
          welcomeMessagePlaceholder: 'Add a message to the invitation…',
          sendInvite: 'Send invitation',
        }}
      />
    </div>
  );
}
