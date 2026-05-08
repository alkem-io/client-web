import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useInviteUsersDialogQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  type InvitationResult,
  InviteMembersDialog,
  type InviteRole,
} from '@/crd/components/community/InviteMembersDialog';
import type { ContributorSelectorInvitee, ContributorSelectorUserResult } from '@/crd/forms/ContributorSelector';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import emailParser from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/emailParser';
import { useContributors } from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export type InviteMembersDialogConnectorProps = {
  open: boolean;
  onClose: () => void;
  /**
   * When true, only existing parent-community members can be invited and the
   * email-paste path is hidden. Mirrors the legacy `InviteContributorsDialog`
   * `onlyFromParentCommunity` behaviour.
   */
  onlyFromParentCommunity?: boolean;
};

const SEARCH_DEBOUNCE_MS = 300;

// Match the regex used by the legacy validation layer (FormikContributorsSelectorField.validation).
// Inlined here to avoid coupling the CRD connector to a Yup schema we don't otherwise use.
const EMAIL_REGEX =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?$/i;
const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim().toLowerCase());

const ROLE_TO_NAME: Record<InviteRole, RoleName> = {
  Member: RoleName.Member,
  Lead: RoleName.Lead,
  Admin: RoleName.Admin,
};

/**
 * Wires the CRD `InviteMembersDialog` to Apollo, the existing email parser,
 * the legacy contributor search hook, and the `inviteContributorsOnRoleSet`
 * mutation. Owns ALL i18n resolution so the presentational layer stays
 * label-free.
 */
export function InviteMembersDialogConnector({
  open,
  onClose,
  onlyFromParentCommunity = false,
}: InviteMembersDialogConnectorProps) {
  const { t } = useTranslation('crd-community');
  const notify = useNotification();
  const { spaceId, parentSpaceId } = useUrlResolver();
  const { userModel: currentUser } = useCurrentUserContext();

  const { data: spaceData, loading: loadingSpace } = useInviteUsersDialogQuery({
    variables: { spaceId: spaceId ?? '' },
    skip: !open || !spaceId,
  });

  const spaceName = spaceData?.lookup.space?.about.profile.displayName ?? '';
  const roleSetId = spaceData?.lookup.space?.about.membership.roleSetID;

  // ---------- form state ----------
  const [selectedContributors, setSelectedContributors] = useState<ContributorSelectorInvitee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [extraRoles, setExtraRoles] = useState<InviteRole[]>(['Member']);
  const [results, setResults] = useState<InvitationResult[] | undefined>(undefined);
  const [isSending, startTransition] = useTransition();

  // Pre-fill the welcome message once we know the space name. Keep it in sync
  // when the user reopens the dialog OR when the space name resolves later
  // (slow network). If the user has typed their own message, don't overwrite —
  // detect by comparing against the previous default.
  const [defaultMessage, setDefaultMessage] = useState('');
  useEffect(() => {
    if (!open || !spaceName) return;
    const next = t('inviteMembers.dialog.defaultWelcomeMessage', { spaceName });
    if (welcomeMessage === '' || welcomeMessage === defaultMessage) {
      setWelcomeMessage(next);
    }
    setDefaultMessage(next);
  }, [open, spaceName, t, welcomeMessage, defaultMessage]);

  // Debounce the search query so we don't fire useContributors on every
  // keystroke. 300ms matches the legacy debounce.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const {
    data: contributors = [],
    hasMore,
    loading: contributorsLoading,
    fetchMore,
  } = useContributors({
    filter: debouncedQuery ? { displayName: debouncedQuery, email: debouncedQuery } : undefined,
    parentSpaceId,
    onlyUsersInRole: onlyFromParentCommunity,
    pageSize: 20,
  });

  // Map raw contributor rows to the CRD prop shape and exclude self + already-selected.
  const selectedUserIds = new Set(
    selectedContributors.filter(c => c.kind === 'user').map(c => (c as { kind: 'user'; userId: string }).userId)
  );
  const searchResults: ContributorSelectorUserResult[] = contributors
    .filter(c => c.id !== currentUser?.id)
    .filter(c => !selectedUserIds.has(c.id))
    .map(c => {
      const profile = c.profile;
      const city = profile?.location?.city?.trim() ?? '';
      const country = profile?.location?.country?.trim() ?? '';
      const location = city && country ? `${city}, ${country}` : city ? city : country ? country : undefined;
      return {
        userId: c.id,
        displayName: profile?.displayName ?? '',
        avatarUrl: profile?.visual?.uri,
        location,
      };
    });

  // ---------- handlers ----------
  const handleSelectUser = (userId: string) => {
    const row = searchResults.find(r => r.userId === userId);
    if (!row) return;
    setSelectedContributors(prev => [
      ...prev,
      {
        kind: 'user',
        userId: row.userId,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl,
        location: row.location,
      },
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

  const { inviteContributorsOnRoleSet, loading: loadingRoleSet } = useRoleSetApplicationsAndInvitations({ roleSetId });

  const buildResults = (
    submittedInvitees: ContributorSelectorInvitee[],
    legacyResults: Awaited<ReturnType<typeof inviteContributorsOnRoleSet>>
  ): InvitationResult[] => {
    // The legacy mutation returns one InvitationResultModel per invitee; we
    // re-correlate by display name (users) or email (platform invitees).
    return submittedInvitees.map(invitee => {
      const legacyResult = legacyResults.find(r => {
        if (invitee.kind === 'user') {
          return r.invitation?.actor?.id === invitee.userId;
        }
        return r.platformInvitation?.email?.toLowerCase() === invitee.email.toLowerCase();
      });
      if (!legacyResult) {
        return { invitee, outcome: 'error' as const, errorMessage: 'No result returned' };
      }
      const outcome: InvitationResult['outcome'] =
        legacyResult.type === 'INVITED_TO_ROLE_SET' || legacyResult.type === 'INVITED_TO_PLATFORM_AND_ROLE_SET'
          ? 'sent'
          : legacyResult.type === 'ALREADY_INVITED_TO_ROLE_SET' ||
              legacyResult.type === 'ALREADY_INVITED_TO_PLATFORM_AND_ROLE_SET'
            ? 'alreadyMember'
            : 'error';
      return { invitee, outcome };
    });
  };

  const handleSend = () => {
    if (!roleSetId) return;
    // Defensive — RoleMultiSelect locks Member, but if a future regression
    // unlocked it, abort silently rather than send an invite without the
    // baseline Member role.
    if (!extraRoles.includes('Member')) return;
    const validInvitees = selectedContributors.filter(c => c.kind === 'user' || c.validationError === undefined);
    if (validInvitees.length === 0) return;

    const invitedContributorIds: string[] = [];
    const invitedUserEmails: string[] = [];
    for (const invitee of validInvitees) {
      if (invitee.kind === 'user') invitedContributorIds.push(invitee.userId);
      else invitedUserEmails.push(invitee.email);
    }

    startTransition(async () => {
      try {
        const legacyResults = await inviteContributorsOnRoleSet({
          roleSetId,
          invitedContributorIds,
          invitedUserEmails,
          welcomeMessage,
          extraRoles: extraRoles.map(role => ROLE_TO_NAME[role]),
        });
        setResults(buildResults(validInvitees, legacyResults));
      } catch (_err) {
        notify(t('inviteMembers.errors.networkFailure'), 'error');
        // Stay on the form view with chips intact (per spec FR-007 edge case).
      }
    });
  };

  const handleBack = () => {
    setSelectedContributors([]);
    setResults(undefined);
    // welcomeMessage and extraRoles are intentionally retained.
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Reset everything on close so the next open starts fresh.
      setSelectedContributors([]);
      setSearchQuery('');
      setDebouncedQuery('');
      setWelcomeMessage('');
      setDefaultMessage('');
      setExtraRoles(['Member']);
      setResults(undefined);
      onClose();
    }
  };

  // ---------- render ----------
  // The dialog is hidden but mounted while the space query is loading — once
  // `roleSetId` resolves, Send becomes available. spaceName empty → title
  // shows the placeholder ("…").
  return (
    <InviteMembersDialog
      open={open}
      onOpenChange={handleOpenChange}
      spaceName={spaceName || '…'}
      selectedContributors={selectedContributors}
      searchResults={searchResults}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelectUser={handleSelectUser}
      onAddEmails={onlyFromParentCommunity ? undefined : handleAddEmails}
      onRemoveContributor={handleRemoveContributor}
      searchLoading={contributorsLoading || loadingSpace || loadingRoleSet}
      hasMoreSearchResults={hasMore}
      onLoadMoreSearchResults={fetchMore}
      allowEmailInvites={!onlyFromParentCommunity}
      welcomeMessage={welcomeMessage}
      onWelcomeMessageChange={setWelcomeMessage}
      extraRoles={extraRoles}
      onExtraRolesChange={setExtraRoles}
      sending={isSending}
      results={results}
      onSend={handleSend}
      onBack={handleBack}
      labels={{
        title: t('inviteMembers.dialog.title', { spaceName: spaceName || '…' }),
        searchHint: t('inviteMembers.dialog.searchHint'),
        searchPlaceholder: t('inviteMembers.dialog.searchPlaceholder'),
        searchAriaLabel: t('inviteMembers.dialog.searchAriaLabel'),
        noResultsLabel: t('inviteMembers.dialog.noResultsLabel'),
        loadingLabel: t('inviteMembers.dialog.loadingLabel'),
        loadMoreLabel: t('inviteMembers.dialog.loadMoreLabel'),
        removeAriaLabel: (label: string) => t('inviteMembers.dialog.removeAriaLabel', { label }),
        validationErrorLabel: kind =>
          kind === 'invalid' ? t('inviteMembers.errors.invalidEmail') : t('inviteMembers.errors.duplicateEmail'),
        welcomeMessageLabel: t('inviteMembers.dialog.welcomeMessageLabel'),
        welcomeMessagePlaceholder: t('inviteMembers.dialog.welcomeMessagePlaceholder'),
        emailVisibilityNote: t('inviteMembers.dialog.emailVisibilityNote'),
        inviteToRoleLabel: t('inviteMembers.dialog.inviteToRoleLabel'),
        rolePopoverHelper: t('inviteMembers.dialog.rolePopoverHelper'),
        rolePopoverAriaLabel: t('inviteMembers.dialog.rolePopoverAriaLabel'),
        roleLabels: {
          Member: t('inviteMembers.roles.Member'),
          Lead: t('inviteMembers.roles.Lead'),
          Admin: t('inviteMembers.roles.Admin'),
        },
        sendButtonLabel: t('inviteMembers.dialog.sendButtonLabel'),
        sendingButtonLabel: t('inviteMembers.dialog.sendingButtonLabel'),
        backButtonLabel: t('inviteMembers.dialog.backButtonLabel'),
        closeButtonLabel: t('inviteMembers.dialog.closeButtonLabel'),
        closeAriaLabel: t('inviteMembers.dialog.closeAriaLabel'),
        resultOutcomeLabels: {
          sent: t('inviteMembers.results.sent'),
          alreadyMember: t('inviteMembers.results.alreadyMember'),
          error: t('inviteMembers.results.error', { message: '' }),
        },
      }}
    />
  );
}
