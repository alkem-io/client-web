import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useInviteForEntryRoleOnRoleSetMutation } from '@/core/apollo/generated/apollo-hooks';
import { RoleName, RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  type InvitationResult,
  InviteMembersDialog,
  type InviteRole,
} from '@/crd/components/community/InviteMembersDialog';
import type { ContributorSelectorInvitee, ContributorSelectorUserResult } from '@/crd/forms/ContributorSelector';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';

export type OrgInviteAssociatesDialogConnectorProps = {
  open: boolean;
  onClose: () => void;
  roleSetId: string | undefined;
  organizationName: string;
  /** Users who already hold Associate — excluded from the candidate list. */
  existingAssociateIds: string[];
  onSent: () => void;
};

const ROLE_TO_NAME: Record<Extract<InviteRole, 'Associate' | 'Admin' | 'Owner'>, RoleName> = {
  Associate: RoleName.Associate,
  Admin: RoleName.Admin,
  Owner: RoleName.Owner,
};

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Wires `InviteMembersDialog` `target="organization"` to `inviteForEntryRoleOnRoleSet` —
 * a dedicated connector rather than a branch of the Space `InviteMembersDialogConnector`,
 * which resolves candidates and role-set id from the URL-scoped Space; the organization
 * target has neither (D16).
 */
export function OrgInviteAssociatesDialogConnector({
  open,
  onClose,
  roleSetId,
  organizationName,
  existingAssociateIds,
  onSent,
}: OrgInviteAssociatesDialogConnectorProps) {
  const { t } = useTranslation('crd-community');
  const notify = useNotification();

  const [selectedContributors, setSelectedContributors] = useState<ContributorSelectorInvitee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [extraRoles, setExtraRoles] = useState<InviteRole[]>(['Associate']);
  const [results, setResults] = useState<InvitationResult[] | undefined>(undefined);
  const [isSending, startTransition] = useTransition();

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  useEffect(() => {
    if (open) {
      setWelcomeMessage(t('inviteMembers.dialog.associates.defaultWelcomeMessage', { organizationName }));
    }
  }, [open, organizationName, t]);

  const trimmedQuery = debouncedQuery.trim();
  const {
    users,
    hasMore,
    loading: searchLoading,
    fetchMore,
  } = useRoleSetAvailableUsers({
    roleSetId,
    mode: 'platform',
    role: RoleName.Associate,
    filter: trimmedQuery || undefined,
    usersAlreadyInRole: existingAssociateIds.map(id => ({ id })),
  });
  const selectedUserIds = new Set(
    selectedContributors.filter(c => c.kind === 'user').map(c => (c as { kind: 'user'; userId: string }).userId)
  );
  const searchResults: ContributorSelectorUserResult[] = users
    .filter(u => !selectedUserIds.has(u.id))
    .map(u => ({ userId: u.id, displayName: u.profile?.displayName ?? '' }));

  const [runInvite] = useInviteForEntryRoleOnRoleSetMutation();

  const handleSelectUser = (id: string) => {
    const row = searchResults.find(r => r.userId === id);
    if (!row) return;
    setSelectedContributors(prev => [
      ...prev,
      { kind: 'user', userId: row.userId, displayName: row.displayName, avatarUrl: row.avatarUrl },
    ]);
    setSearchQuery('');
  };
  const handleRemoveContributor = (index: number) => {
    setSelectedContributors(prev => prev.filter((_, i) => i !== index));
  };

  const resultOutcomeLabels = {
    sent: t('inviteMembers.results.sent'),
    alreadyInvited: t('inviteMembers.results.alreadyInvited'),
    alreadyMember: t('inviteMembers.results.alreadyAssociate'),
    alreadyHasApplication: t('inviteMembers.results.alreadyHasApplication'),
    parentNotAuthorized: t('inviteMembers.results.parentNotAuthorized'),
    notAcceptingInvitations: t('inviteMembers.results.notAcceptingInvitations'),
    leadLimitReached: t('inviteMembers.results.leadLimitReached'),
    extraRoleLimitReached: t('inviteMembers.results.extraRoleLimitReached'),
    error: t('inviteMembers.results.error'),
  } satisfies Record<InvitationResult['outcome'], string>;

  const handleSend = () => {
    if (!roleSetId) return;
    if (!extraRoles.includes('Associate')) return;
    const validInvitees = selectedContributors.filter(c => c.kind === 'user');
    if (validInvitees.length === 0) return;

    const invitedContributorIds = validInvitees.map(c => (c as { kind: 'user'; userId: string }).userId);
    const extraRoleNames = extraRoles.filter((r): r is 'Admin' | 'Owner' => r === 'Admin' || r === 'Owner');

    startTransition(async () => {
      try {
        const { data } = await runInvite({
          variables: {
            roleSetId,
            invitedActorIds: invitedContributorIds,
            invitedUserEmails: [],
            welcomeMessage,
            extraRoles: extraRoleNames.map(r => ROLE_TO_NAME[r]),
          },
        });
        const legacyResults = data?.inviteForEntryRoleOnRoleSet ?? [];
        const remaining = [...legacyResults];
        const built: InvitationResult[] = validInvitees.map(invitee => {
          const idx = remaining.findIndex(r => r.invitation?.actor?.id === (invitee as { userId: string }).userId);
          const legacyResult = idx === -1 ? undefined : remaining.splice(idx, 1)[0];
          if (!legacyResult) return { invitee, outcome: 'error' as const };
          const outcome: InvitationResult['outcome'] =
            legacyResult.type === RoleSetInvitationResultType.InvitedToRoleSet
              ? 'sent'
              : legacyResult.type === RoleSetInvitationResultType.AlreadyInvitedToRoleSet
                ? 'alreadyInvited'
                : legacyResult.type === RoleSetInvitationResultType.AlreadyMemberOfRoleSet
                  ? 'alreadyMember'
                  : legacyResult.type === RoleSetInvitationResultType.AlreadyHasOpenApplication
                    ? 'alreadyHasApplication'
                    : legacyResult.type === RoleSetInvitationResultType.ExtraRoleLimitReached
                      ? 'extraRoleLimitReached'
                      : 'error';
          return { invitee, outcome };
        });
        setResults(built);
        onSent();
      } catch {
        notify(t('inviteMembers.errors.networkFailure'), 'error');
      }
    });
  };

  const handleBack = () => {
    setSelectedContributors([]);
    setResults(undefined);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedContributors([]);
      setSearchQuery('');
      setDebouncedQuery('');
      setWelcomeMessage('');
      setExtraRoles(['Associate']);
      setResults(undefined);
      onClose();
    }
  };

  return (
    <InviteMembersDialog
      open={open}
      onOpenChange={handleOpenChange}
      kind="user"
      target="organization"
      spaceName={organizationName || '…'}
      selectedContributors={selectedContributors}
      searchResults={searchResults}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelectUser={handleSelectUser}
      onRemoveContributor={handleRemoveContributor}
      searchLoading={searchLoading}
      hasMoreSearchResults={hasMore}
      onLoadMoreSearchResults={() => fetchMore()}
      allowEmailInvites={false}
      welcomeMessage={welcomeMessage}
      onWelcomeMessageChange={setWelcomeMessage}
      extraRoles={extraRoles}
      onExtraRolesChange={setExtraRoles}
      sending={isSending}
      results={results}
      onSend={handleSend}
      onBack={handleBack}
      labels={{
        title: t('inviteMembers.dialog.associates.title', { organizationName: organizationName || '…' }),
        searchHint: t('inviteMembers.dialog.associates.searchHint'),
        searchPlaceholder: t('inviteMembers.dialog.associates.searchPlaceholder'),
        searchAriaLabel: t('inviteMembers.dialog.associates.searchAriaLabel'),
        noResultsLabel: t('inviteMembers.dialog.associates.noResultsLabel'),
        loadingLabel: t('inviteMembers.dialog.associates.loadingLabel'),
        loadMoreLabel: t('inviteMembers.dialog.loadMoreLabel'),
        removeAriaLabel: (label: string) => t('inviteMembers.dialog.removeAriaLabel', { label }),
        validationErrorLabel: errKind =>
          errKind === 'invalid' ? t('inviteMembers.errors.invalidEmail') : t('inviteMembers.errors.duplicateEmail'),
        welcomeMessageLabel: t('inviteMembers.dialog.welcomeMessageLabel'),
        welcomeMessagePlaceholder: t('inviteMembers.dialog.welcomeMessagePlaceholder'),
        inviteToRoleLabel: t('inviteMembers.dialog.inviteToRoleLabel'),
        rolePopoverHelper: t('inviteMembers.dialog.rolePopoverHelper'),
        rolePopoverAriaLabel: t('inviteMembers.dialog.rolePopoverAriaLabel'),
        roleLabels: {
          Associate: t('inviteMembers.roles.Associate'),
          Admin: t('inviteMembers.roles.Admin'),
          Owner: t('inviteMembers.roles.Owner'),
        },
        sendButtonLabel: t('inviteMembers.dialog.sendButtonLabel'),
        sendingButtonLabel: t('inviteMembers.dialog.sendingButtonLabel'),
        backButtonLabel: t('inviteMembers.dialog.backButtonLabel'),
        closeButtonLabel: t('inviteMembers.dialog.closeButtonLabel'),
        closeAriaLabel: t('inviteMembers.dialog.closeAriaLabel'),
        resultsSummary: (count: number) =>
          t('inviteMembers.dialog.resultsSummary', { count, spaceName: organizationName || '…' }),
        resultOutcomeLabels,
      }}
    />
  );
}

export default OrgInviteAssociatesDialogConnector;
