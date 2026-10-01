import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useInviteForEntryRoleOnRoleSetMutation } from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  type InvitationResult,
  InviteMembersDialog,
  type InviteRole,
} from '@/crd/components/community/InviteMembersDialog';
import type { ContributorSelectorInvitee, ContributorSelectorUserResult } from '@/crd/forms/ContributorSelector';
import useRoleSetAvailableUsers from '@/domain/access/AvailableContributors/useRoleSetAvailableUsers';
import type InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import emailParser from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/emailParser';
import { useConfig } from '@/domain/platform/config/useConfig';
import { isValidEmail, mapInvitationResults } from '@/main/crdPages/space/dialogs/InviteMembersDialogConnector';

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
 * target has neither. Pasted email addresses (people not yet on the platform) and the
 * suggested invitation language go through the same mutation and the same result
 * correlation as the Space dialog.
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
  const { i18n } = useTranslation();
  const notify = useNotification();

  const { language: languageConfig } = useConfig();
  const eligibleLanguages = (languageConfig?.eligible ?? []).map(code => ({
    code,
    // biome-ignore lint/suspicious/noExplicitAny: dynamic key — code is an eligible language code from server config
    label: String((i18n as any).t(`languages.${code}`)),
  }));

  const [selectedContributors, setSelectedContributors] = useState<ContributorSelectorInvitee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [extraRoles, setExtraRoles] = useState<InviteRole[]>(['Associate']);
  const [suggestedLanguage, setSuggestedLanguage] = useState<string | undefined>(undefined);
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
  const handleAddEmails = (rawText: string) => {
    const parsed = emailParser(rawText);
    if (parsed.length === 0) return;

    const existingEmails = new Set(
      selectedContributors
        .filter(c => c.kind === 'email')
        .map(c => (c as { kind: 'email'; email: string }).email.toLowerCase())
    );

    const additions: ContributorSelectorInvitee[] = [];
    for (const entry of parsed) {
      const email = entry.email.trim();
      if (!email) continue;
      const lowered = email.toLowerCase();
      if (existingEmails.has(lowered)) {
        additions.push({ kind: 'email', email, validationError: 'duplicate' });
        continue;
      }
      if (!isValidEmail(email)) {
        additions.push({ kind: 'email', email, validationError: 'invalid' });
        continue;
      }
      existingEmails.add(lowered);
      additions.push({ kind: 'email', email });
    }
    if (additions.length > 0) {
      setSelectedContributors(prev => [...prev, ...additions]);
    }
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
    const validInvitees = selectedContributors.filter(
      c => c.kind === 'user' || (c.kind === 'email' && c.validationError === undefined)
    );
    if (validInvitees.length === 0) return;

    const invitedContributorIds: string[] = [];
    const invitedUserEmails: string[] = [];
    for (const invitee of validInvitees) {
      if (invitee.kind === 'user') invitedContributorIds.push(invitee.userId);
      else if (invitee.kind === 'email') invitedUserEmails.push(invitee.email);
    }
    const extraRoleNames = extraRoles.filter((r): r is 'Admin' | 'Owner' => r === 'Admin' || r === 'Owner');

    startTransition(async () => {
      try {
        const { data } = await runInvite({
          variables: {
            roleSetId,
            invitedActorIds: invitedContributorIds,
            invitedUserEmails,
            welcomeMessage,
            extraRoles: extraRoleNames.map(r => ROLE_TO_NAME[r]),
            // Only include a language when the host explicitly chose one.
            suggestedLanguage,
          },
        });
        const legacyResults: InvitationResultModel[] = data?.inviteForEntryRoleOnRoleSet ?? [];
        // Results are matched to chips by identity (invited actor id / invited email), never by
        // position: the server moves an email that belongs to a registered user into the actor
        // group, so result order does not follow the order chips were submitted in.
        setResults(mapInvitationResults(validInvitees, legacyResults));
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
      setSuggestedLanguage(undefined);
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
      onAddEmails={handleAddEmails}
      allowEmailInvites={true}
      availableLanguages={eligibleLanguages}
      suggestedLanguage={suggestedLanguage}
      onSuggestedLanguageChange={setSuggestedLanguage}
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
        searchHint: t('inviteMembers.dialog.searchHint'),
        searchPlaceholder: t('inviteMembers.dialog.searchPlaceholder'),
        searchAriaLabel: t('inviteMembers.dialog.searchAriaLabel'),
        noResultsLabel: t('inviteMembers.dialog.associates.noResultsLabel'),
        loadingLabel: t('inviteMembers.dialog.associates.loadingLabel'),
        loadMoreLabel: t('inviteMembers.dialog.loadMoreLabel'),
        removeAriaLabel: (label: string) => t('inviteMembers.dialog.removeAriaLabel', { label }),
        validationErrorLabel: errKind =>
          errKind === 'invalid' ? t('inviteMembers.errors.invalidEmail') : t('inviteMembers.errors.duplicateEmail'),
        welcomeMessageLabel: t('inviteMembers.dialog.welcomeMessageLabel'),
        welcomeMessagePlaceholder: t('inviteMembers.dialog.welcomeMessagePlaceholder'),
        inviteToRoleLabel: t('inviteMembers.dialog.inviteToRoleLabel'),
        rolePopoverHelper: t('inviteMembers.dialog.associates.rolePopoverHelper'),
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
        suggestedLanguageLabel: t('inviteMembers.dialog.suggestedLanguageLabel'),
        suggestedLanguagePlaceholder: t('inviteMembers.dialog.suggestedLanguagePlaceholder'),
        suggestedLanguageNoPreferenceLabel: t('inviteMembers.dialog.suggestedLanguagePlaceholder'),
      }}
    />
  );
}

export default OrgInviteAssociatesDialogConnector;
