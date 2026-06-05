import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useAvailableUsersForEntryRoleQuery, useInviteUsersDialogQuery } from '@/core/apollo/generated/apollo-hooks';
import { RoleName, RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';
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
  /**
   * Override the URL-resolved space. Required when the dialog is opened from
   * (sub)space settings, where the route may resolve to a parent space but the
   * invite must target the (sub)space being edited. `spaceName` + `roleSetId`
   * are then derived from this id via `useInviteUsersDialogQuery`.
   */
  spaceId?: string;
};

const SEARCH_DEBOUNCE_MS = 300;
const INVITE_PAGE_SIZE = 20;

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
  spaceId: spaceIdOverride,
}: InviteMembersDialogConnectorProps) {
  const { t } = useTranslation('crd-community');
  const notify = useNotification();
  const { spaceId: resolvedSpaceId, parentSpaceId } = useUrlResolver();
  const spaceId = spaceIdOverride ?? resolvedSpaceId;
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

  // Candidate-list source depends on level:
  //  - L0 / L1 (`!onlyFromParentCommunity`): the (sub)space's OWN role set via
  //    `availableUsersForEntryRole`. The server returns the setting-aware,
  //    privilege-aware invitable set — the full platform list, or only parent-space
  //    members when the caller can't invite to the parent — and already excludes
  //    current members. This replaces the old global `usersPaginated` directory,
  //    which ignored the space/setting and surfaced non-parent-members at L1.
  //  - L2 (`onlyFromParentCommunity`): unchanged legacy behaviour — only existing
  //    parent-community members, via `useContributors` (usersInRoles based).
  // Trim once: a pasted value with surrounding whitespace (e.g. an email with a
  // trailing space) must not gate `skip` as non-empty while leaking the
  // whitespace into the server-side filter — that yields zero matches. The same
  // trimmed value drives the server filter, the skip gate, and the L2
  // client-side match below.
  const trimmedQuery = debouncedQuery.trim();
  const searchFilter = trimmedQuery ? { displayName: trimmedQuery, email: trimmedQuery } : undefined;

  const {
    data: entryRoleData,
    loading: entryRoleLoading,
    fetchMore: entryRoleFetchMore,
  } = useAvailableUsersForEntryRoleQuery({
    variables: { roleSetId: roleSetId ?? '', first: INVITE_PAGE_SIZE, filter: searchFilter },
    skip: !open || onlyFromParentCommunity || !roleSetId || !trimmedQuery,
  });
  const entryRolePage = entryRoleData?.lookup.roleSet?.availableUsersForEntryRole;

  const {
    data: parentMembers = [],
    hasMore: parentHasMore,
    loading: parentLoading,
    fetchMore: parentFetchMore,
  } = useContributors({
    filter: searchFilter,
    // Only the L2 path consults the parent community; pass undefined otherwise so
    // the hook short-circuits instead of firing the global usersPaginated query.
    parentSpaceId: onlyFromParentCommunity ? parentSpaceId : undefined,
    onlyUsersInRole: true,
    pageSize: INVITE_PAGE_SIZE,
  });

  const contributorsLoading = onlyFromParentCommunity ? parentLoading : entryRoleLoading;
  const hasMore = onlyFromParentCommunity ? parentHasMore : (entryRolePage?.pageInfo.hasNextPage ?? false);
  const fetchMore = onlyFromParentCommunity
    ? parentFetchMore
    : () => {
        if (!roleSetId || !entryRolePage) return;
        void entryRoleFetchMore({
          variables: {
            roleSetId,
            first: INVITE_PAGE_SIZE,
            after: entryRolePage.pageInfo.endCursor,
            filter: searchFilter,
          },
        });
      };

  // Normalise both sources to a common row shape, then exclude self + already-selected.
  const selectedUserIds = new Set(
    selectedContributors.filter(c => c.kind === 'user').map(c => (c as { kind: 'user'; userId: string }).userId)
  );
  // The entry-role query (L0/L1) filters server-side. The parent-members (L2)
  // source ignores the `filter` arg, so the search box would otherwise do
  // nothing — apply a client-side displayName match for that path.
  const query = trimmedQuery.toLowerCase();
  const rawCandidates = (onlyFromParentCommunity ? parentMembers : (entryRolePage?.users ?? []))
    .map(c => ({
      id: c.id,
      displayName: c.profile?.displayName ?? '',
      avatarUrl: c.profile?.visual?.uri,
      city: c.profile?.location?.city,
      country: c.profile?.location?.country,
    }))
    .filter(c => !onlyFromParentCommunity || !query || c.displayName.toLowerCase().includes(query));
  const searchResults: ContributorSelectorUserResult[] = rawCandidates
    .filter(c => c.id !== currentUser?.id)
    .filter(c => !selectedUserIds.has(c.id))
    .map(c => {
      const city = c.city?.trim() ?? '';
      const country = c.country?.trim() ?? '';
      const location = city && country ? `${city}, ${country}` : city ? city : country ? country : undefined;
      return { userId: c.id, displayName: c.displayName, avatarUrl: c.avatarUrl, location };
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

  // Each outcome's label is a complete sentence. Shared by the result rows and
  // the completion toast so the wording stays in one place.
  const resultOutcomeLabels = {
    sent: t('inviteMembers.results.sent'),
    alreadyInvited: t('inviteMembers.results.alreadyInvited'),
    alreadyMember: t('inviteMembers.results.alreadyMember'),
    alreadyHasApplication: t('inviteMembers.results.alreadyHasApplication'),
    parentNotAuthorized: t('inviteMembers.results.parentNotAuthorized'),
    error: t('inviteMembers.results.error'),
  } satisfies Record<InvitationResult['outcome'], string>;

  const buildResults = (
    submittedInvitees: ContributorSelectorInvitee[],
    legacyResults: Awaited<ReturnType<typeof inviteContributorsOnRoleSet>>
  ): InvitationResult[] => {
    // The mutation returns one result per invitee. Successful results carry the
    // created `invitation`/`platformInvitation`, so we correlate those by
    // actor id / email. Failure results (e.g. INVITATION_TO_PARENT_NOT_AUTHORIZED)
    // come back with BOTH null, so they can't be matched that way — consume each
    // result once and fall back to the next id-less result for those invitees.
    const remaining = [...legacyResults];
    const take = (predicate: (r: (typeof legacyResults)[number]) => boolean) => {
      const idx = remaining.findIndex(predicate);
      return idx === -1 ? undefined : remaining.splice(idx, 1)[0];
    };
    return submittedInvitees.map(invitee => {
      const matched =
        invitee.kind === 'user'
          ? take(r => r.invitation?.actor?.id === invitee.userId)
          : take(r => r.platformInvitation?.email?.toLowerCase() === invitee.email.toLowerCase());
      const legacyResult = matched ?? take(r => !r.invitation && !r.platformInvitation);
      if (!legacyResult) {
        return { invitee, outcome: 'error' as const };
      }
      const outcome: InvitationResult['outcome'] =
        legacyResult.type === RoleSetInvitationResultType.InvitedToRoleSet ||
        legacyResult.type === RoleSetInvitationResultType.InvitedToPlatformAndRoleSet
          ? 'sent'
          : legacyResult.type === RoleSetInvitationResultType.AlreadyInvitedToRoleSet ||
              legacyResult.type === RoleSetInvitationResultType.AlreadyInvitedToPlatformAndRoleSet
            ? 'alreadyInvited'
            : legacyResult.type === RoleSetInvitationResultType.AlreadyMemberOfRoleSet
              ? 'alreadyMember'
              : legacyResult.type === RoleSetInvitationResultType.AlreadyHasOpenApplication
                ? 'alreadyHasApplication'
                : legacyResult.type === RoleSetInvitationResultType.InvitationToParentNotAuthorized
                  ? 'parentNotAuthorized'
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
        const built = buildResults(validInvitees, legacyResults);
        setResults(built);
        // The result rows show per-invitee detail, but a non-sent outcome is easy
        // to miss inside the dialog — surface a toast too. A single outcome shows
        // its specific reason; a batch shows a count. `alreadyInvited`,
        // `alreadyMember` and `alreadyHasApplication` are informational (the invite
        // wasn't needed/possible), not failures, so they keep an 'info' severity —
        // only a genuine failure turns the toast into an error.
        const notSent = built.filter(r => r.outcome !== 'sent');
        if (notSent.length > 0) {
          const hasFailure = notSent.some(r => r.outcome === 'error' || r.outcome === 'parentNotAuthorized');
          const message =
            notSent.length === 1
              ? resultOutcomeLabels[notSent[0].outcome]
              : t('inviteMembers.toast.someFailed', { count: notSent.length });
          notify(message, hasFailure ? 'error' : 'info');
        }
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
        resultOutcomeLabels,
      }}
    />
  );
}
