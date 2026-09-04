import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useAvailableUsersForEntryRoleQuery, useInviteUsersDialogQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  ActorType,
  RoleName,
  RoleSetInvitationResultNotice,
  RoleSetInvitationResultType,
  SpaceLevel,
  type VirtualContributorFullFragment,
} from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import {
  type InvitationResult,
  type InviteKind,
  InviteMembersDialog,
  type InviteRole,
  type VcInviteItem,
} from '@/crd/components/community/InviteMembersDialog';
import type { VcPreviewData } from '@/crd/components/virtualContributor/community/VirtualContributorPreview.types';
import type { ContributorSelectorInvitee, ContributorSelectorUserResult } from '@/crd/forms/ContributorSelector';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import useRoleSetAvailableContributors from '@/domain/access/AvailableContributors/useRoleSetAvailableContributors';
import type InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import useRoleSetManager, { RELEVANT_ROLES } from '@/domain/access/RoleSetManager/useRoleSetManager';
import { InvitationState } from '@/domain/community/invitations/InvitationApplicationConstants';
import emailParser from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/emailParser';
import { useContributors } from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import useCommunityAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useCommunityAdmin';
import useVirtualContributorsAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useVirtualContributorsAdmin';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export type InviteMembersDialogConnectorProps = {
  open: boolean;
  onClose: () => void;
  /** Who is being invited. Defaults to 'user' — the original behaviour of this connector. */
  kind?: InviteKind;
  /**
   * When true, only existing parent-community members can be invited and the
   * email-paste path is hidden. Mirrors the legacy `InviteContributorsDialog`
   * `onlyFromParentCommunity` behaviour. User kind only.
   */
  onlyFromParentCommunity?: boolean;
  /**
   * Override the URL-resolved space. Required when the dialog is opened from
   * (sub)space settings, where the route may resolve to a parent space but the
   * invite must target the (sub)space being edited. `spaceName` + `roleSetId`
   * are then derived from this id via `useInviteUsersDialogQuery`.
   */
  spaceId?: string;
  /**
   * virtualContributor kind only: only the library section is shown (the settings
   * "Invite External Virtual Contributor" entry — account VCs are added via a
   * separate button there). Mirrors the pre-fold VirtualContributorInviteConnector prop.
   */
  libraryOnly?: boolean;
};

/**
 * Correlates the mutation's per-invitee results back to what was submitted.
 * Successful results carry the created `invitation`/`platformInvitation`, so
 * those are matched by actor id (organization) / userId (user) / email
 * (platform invite). Typed failures that create nothing (opt-out, Lead limit,
 * already member, ...) come back with both null, so they can't be matched
 * that way — each result is consumed once and unmatched invitees fall back to
 * the next id-less result in submission order (the server returns one result
 * per invitee, in input order). Exported for unit testing (T007).
 */
export const mapInvitationResults = (
  submittedInvitees: ContributorSelectorInvitee[],
  legacyResults: InvitationResultModel[]
): InvitationResult[] => {
  const remaining = [...legacyResults];
  const take = (predicate: (r: InvitationResultModel) => boolean) => {
    const idx = remaining.findIndex(predicate);
    return idx === -1 ? undefined : remaining.splice(idx, 1)[0];
  };
  return submittedInvitees.map(invitee => {
    const matched =
      invitee.kind === 'organization'
        ? take(r => r.invitation?.actor?.id === invitee.id)
        : invitee.kind === 'user'
          ? take(r => r.invitation?.actor?.id === invitee.userId)
          : invitee.kind === 'email'
            ? take(r => r.platformInvitation?.email?.toLowerCase() === invitee.email.toLowerCase())
            : undefined;
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
                : legacyResult.type === RoleSetInvitationResultType.OrganizationNotAcceptingInvitations
                  ? 'notAcceptingInvitations'
                  : legacyResult.type === RoleSetInvitationResultType.OrganizationLeadRoleLimitReached
                    ? 'leadLimitReached'
                    : 'error';
    const notice: InvitationResult['notice'] =
      legacyResult.notice === RoleSetInvitationResultNotice.OrganizationHasNoAdministrators
        ? 'noAdministrators'
        : undefined;
    return notice ? { invitee, outcome, notice } : { invitee, outcome };
  });
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
  kind = 'user',
  onlyFromParentCommunity = false,
  spaceId: spaceIdOverride,
  libraryOnly = false,
}: InviteMembersDialogConnectorProps) {
  const { t } = useTranslation('crd-community');
  const { i18n } = useTranslation();
  const notify = useNotification();
  const { spaceId: resolvedSpaceId, parentSpaceId } = useUrlResolver();
  const spaceId = spaceIdOverride ?? resolvedSpaceId;
  const { userModel: currentUser } = useCurrentUserContext();

  // T013 — eligible language set for the suggested-language select control.
  const { language: languageConfig } = useConfig();
  const eligibleLanguages = (languageConfig?.eligible ?? []).map(code => ({
    code,
    // biome-ignore lint/suspicious/noExplicitAny: dynamic key — code is an eligible language code from server config
    label: String((i18n as any).t(`languages.${code}`)),
  }));

  const { data: spaceData, loading: loadingSpace } = useInviteUsersDialogQuery({
    variables: { spaceId: spaceId ?? '' },
    skip: !open || !spaceId,
  });

  const spaceName = spaceData?.lookup.space?.about.profile.displayName ?? '';
  const roleSetId = spaceData?.lookup.space?.about.membership.roleSetID;
  const spaceLevel = spaceData?.lookup.space?.level;

  // ---------- form state ----------
  const [selectedContributors, setSelectedContributors] = useState<ContributorSelectorInvitee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [extraRoles, setExtraRoles] = useState<InviteRole[]>(['Member']);
  const [suggestedLanguage, setSuggestedLanguage] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<InvitationResult[] | undefined>(undefined);
  const [isSending, startTransition] = useTransition();

  // Pre-fill the welcome message once we know the space name. Keep it in sync
  // when the user reopens the dialog OR when the space name resolves later
  // (slow network). If the user has typed their own message, don't overwrite —
  // detect by comparing against the previous default.
  const [defaultMessage, setDefaultMessage] = useState('');
  useEffect(() => {
    if (!open || !spaceName) return;
    const next =
      kind === 'organization'
        ? t('inviteMembers.dialog.organization.defaultWelcomeMessage', { spaceName })
        : t('inviteMembers.dialog.defaultWelcomeMessage', { spaceName });
    if (welcomeMessage === '' || welcomeMessage === defaultMessage) {
      setWelcomeMessage(next);
    }
    setDefaultMessage(next);
  }, [open, spaceName, kind, t, welcomeMessage, defaultMessage]);

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
  const userSearchResults: ContributorSelectorUserResult[] = rawCandidates
    .filter(c => c.id !== currentUser?.id)
    .filter(c => !selectedUserIds.has(c.id))
    .map(c => {
      const city = c.city?.trim() ?? '';
      const country = c.country?.trim() ?? '';
      const location = city && country ? `${city}, ${country}` : city ? city : country ? country : undefined;
      return { userId: c.id, displayName: c.displayName, avatarUrl: c.avatarUrl, location };
    });

  // ---------- organization candidates (D12) ----------
  // Current member/lead organizations of this space are excluded from the search
  // results client-side (the server still rejects a duplicate as a safety net).
  // Fetched narrowly (organizations only, no role definitions) rather than via the
  // heavier useCommunityAdmin, and skipped entirely outside the organization kind.
  const { organizations: currentMemberOrganizations } = useRoleSetManager({
    roleSetId: kind === 'organization' ? roleSetId : undefined,
    relevantRoles: RELEVANT_ROLES.Community,
    contributorTypes: [ActorType.Organization],
    fetchContributors: true,
  });
  const { findAvailableOrganizationsForRoleSet } = useRoleSetAvailableContributors({
    roleSetId,
    filterCurrentMembers: currentMemberOrganizations,
  });
  const [orgCandidates, setOrgCandidates] = useState<ContributorSelectorUserResult[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  // Organizations with an already-open invitation (`invited` state) are excluded — sending
  // another invite would just hit ALREADY_INVITED_TO_ROLE_SET.
  const {
    invitations: existingInvitations,
    inviteContributorsOnRoleSet,
    loading: loadingRoleSet,
  } = useRoleSetApplicationsAndInvitations({ roleSetId });
  const openOrgInvitationIds = new Set(
    existingInvitations
      .filter(inv => inv.contributorType === ActorType.Organization && inv.state === InvitationState.INVITED)
      .map(inv => inv.actor.id)
  );
  const selectedOrgIds = new Set(
    selectedContributors.filter(c => c.kind === 'organization').map(c => (c as { kind: 'organization'; id: string }).id)
  );
  // `findAvailableOrganizationsForRoleSet` is intentionally excluded from deps — it returns a
  // fresh function on every render, so including it would re-fetch on every render. Mirrors
  // VirtualContributorInviteConnector's `lookup` exclusion.
  useEffect(() => {
    if (!open || kind !== 'organization' || !roleSetId) return;
    let cancelled = false;
    setOrgLoading(true);
    void (async () => {
      try {
        const { organizations } = await findAvailableOrganizationsForRoleSet(trimmedQuery || undefined);
        if (cancelled) return;
        setOrgCandidates(organizations.map(org => ({ userId: org.id, displayName: org.profile?.displayName ?? '' })));
      } finally {
        if (!cancelled) setOrgLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, kind, roleSetId, trimmedQuery]);
  const organizationSearchResults: ContributorSelectorUserResult[] = orgCandidates.filter(
    c => !openOrgInvitationIds.has(c.userId) && !selectedOrgIds.has(c.userId)
  );

  const searchResults = kind === 'organization' ? organizationSearchResults : userSearchResults;

  // ---------- virtualContributor candidates (T019 fold) ----------
  // `useCommunityAdmin` is only actually fetched for the virtualContributor kind — its
  // internal `useRoleSetManager` skips its queries when roleSetId is falsy, so passing ''
  // for the other kinds costs nothing. Reused (not re-derived) because virtualContributorAdmin
  // .onAdd (a role ASSIGNMENT, not an invitation) and .inviteContributors already exist there.
  const vcCommunity = useCommunityAdmin({ roleSetId: kind === 'virtualContributor' ? (roleSetId ?? '') : '' });
  const currentVcMemberIds = vcCommunity.virtualContributorAdmin.members.map(m => m.id).join(',');
  const { virtualContributorAdmin: vcLookup } = useVirtualContributorsAdmin({
    level: spaceLevel ?? SpaceLevel.L0,
    spaceId: spaceId ?? '',
    currentMembers: vcCommunity.virtualContributorAdmin.members,
  });
  const [vcAccountItems, setVcAccountItems] = useState<VcInviteItem[]>([]);
  const [vcLibraryItems, setVcLibraryItems] = useState<VcInviteItem[]>([]);
  const [vcFetchedItems, setVcFetchedItems] = useState<VirtualContributorFullFragment[]>([]);
  const [vcLoading, setVcLoading] = useState(false);
  const [vcBusyId, setVcBusyId] = useState<string | null>(null);
  const [vcPreviewData, setVcPreviewData] = useState<VcPreviewData | undefined>(undefined);
  const toVcItem = (vc: { id: string; profile?: { displayName: string } }): VcInviteItem => ({
    id: vc.id,
    displayName: vc.profile?.displayName ?? '',
  });
  const toVcPreviewData = (vc: VirtualContributorFullFragment): VcPreviewData => ({
    id: vc.id,
    displayName: vc.profile?.displayName ?? '',
    avatarUrl: vc.profile?.avatar?.uri,
    tags: (vc.profile?.tagsets ?? []).flatMap(tagset => tagset.tags),
    description: vc.profile?.description ?? '',
  });
  // `vcLookup` is intentionally excluded from deps — it returns a fresh object every render.
  // The space query (`roleSetId`/`spaceLevel`) is still unresolved on the render where
  // `open` flips true, so the effect is gated on both resolving — otherwise it fetches
  // through the L0 branch on a subspace and filters against an empty current-member set.
  // `currentVcMemberIds` (not `vcCommunity.virtualContributorAdmin.members`, a fresh array
  // every render) re-runs the fetch once the member list itself settles.
  useEffect(() => {
    if (!open || kind !== 'virtualContributor' || !roleSetId || !spaceLevel) return;
    let cancelled = false;
    setVcLoading(true);
    void (async () => {
      try {
        const [account, library] = await Promise.all([
          libraryOnly ? Promise.resolve([]) : vcLookup.getAvailable(trimmedQuery || undefined),
          vcLookup.getAvailableInLibrary(trimmedQuery || undefined),
        ]);
        if (cancelled) return;
        setVcAccountItems(account.map(toVcItem));
        setVcLibraryItems(library.map(toVcItem));
        setVcFetchedItems([...account, ...library]);
      } finally {
        if (!cancelled) setVcLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, kind, libraryOnly, trimmedQuery, roleSetId, spaceLevel, currentVcMemberIds]);

  const handleAddAccountVc = async (id: string) => {
    setVcBusyId(id);
    try {
      await vcCommunity.virtualContributorAdmin.onAdd(id);
      notify(t('inviteMembers.dialog.virtualContributor.addedNotice'), 'success');
      onClose();
    } catch {
      notify(t('inviteMembers.dialog.virtualContributor.error'), 'error');
    } finally {
      setVcBusyId(null);
    }
  };

  const handleInviteLibraryVc = async (id: string, message: string) => {
    setVcBusyId(id);
    try {
      await vcCommunity.virtualContributorAdmin.inviteContributors({
        welcomeMessage: message,
        invitedContributorIds: [id],
        invitedUserEmails: [],
      });
      notify(t('inviteMembers.dialog.virtualContributor.invitedNotice'), 'success');
      onClose();
    } catch {
      notify(t('inviteMembers.dialog.virtualContributor.error'), 'error');
    } finally {
      setVcBusyId(null);
    }
  };

  const handlePreviewVc = (id: string) => {
    const vc = vcFetchedItems.find(v => v.id === id);
    setVcPreviewData(vc ? toVcPreviewData(vc) : undefined);
  };

  // ---------- handlers ----------
  const handleSelectUser = (id: string) => {
    const row = searchResults.find(r => r.userId === id);
    if (!row) return;
    if (kind === 'organization') {
      setSelectedContributors(prev => [
        ...prev,
        { kind: 'organization', id: row.userId, displayName: row.displayName, avatarUrl: row.avatarUrl },
      ]);
      setSearchQuery('');
      return;
    }
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

  // Each outcome's label is a complete sentence. Shared by the result rows and
  // the completion toast so the wording stays in one place.
  const resultOutcomeLabels = {
    sent: t('inviteMembers.results.sent'),
    alreadyInvited: t('inviteMembers.results.alreadyInvited'),
    alreadyMember: t('inviteMembers.results.alreadyMember'),
    alreadyHasApplication: t('inviteMembers.results.alreadyHasApplication'),
    parentNotAuthorized: t('inviteMembers.results.parentNotAuthorized'),
    notAcceptingInvitations: t('inviteMembers.results.notAcceptingInvitations'),
    leadLimitReached: t('inviteMembers.results.leadLimitReached'),
    error: t('inviteMembers.results.error'),
  } satisfies Record<InvitationResult['outcome'], string>;

  const handleSend = () => {
    if (!roleSetId) return;
    // Defensive — RoleMultiSelect locks Member, but if a future regression
    // unlocked it, abort silently rather than send an invite without the
    // baseline Member role.
    if (!extraRoles.includes('Member')) return;
    const validInvitees = selectedContributors.filter(
      c => c.kind === 'user' || c.kind === 'organization' || (c.kind === 'email' && c.validationError === undefined)
    );
    if (validInvitees.length === 0) return;

    const invitedContributorIds: string[] = [];
    const invitedUserEmails: string[] = [];
    for (const invitee of validInvitees) {
      if (invitee.kind === 'user') invitedContributorIds.push(invitee.userId);
      else if (invitee.kind === 'organization') invitedContributorIds.push(invitee.id);
      else if (invitee.kind === 'email') invitedUserEmails.push(invitee.email);
    }

    startTransition(async () => {
      try {
        const legacyResults = await inviteContributorsOnRoleSet({
          roleSetId,
          invitedContributorIds,
          invitedUserEmails,
          welcomeMessage,
          extraRoles: extraRoles.map(role => ROLE_TO_NAME[role]),
          // T013: only include when the host explicitly chose a language (FR-015).
          suggestedLanguage,
        });
        const built = mapInvitationResults(validInvitees, legacyResults);
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
      setSuggestedLanguage(undefined);
      setResults(undefined);
      onClose();
    }
  };

  // ---------- render ----------
  // The dialog is hidden but mounted while the space query is loading — once
  // `roleSetId` resolves, Send becomes available. spaceName empty → title
  // shows the placeholder ("…").
  const isOrganization = kind === 'organization';
  const isVirtualContributor = kind === 'virtualContributor';
  const title = isOrganization
    ? t('inviteMembers.dialog.organization.title', { spaceName: spaceName || '…' })
    : isVirtualContributor
      ? t('inviteMembers.dialog.virtualContributor.title')
      : t('inviteMembers.dialog.title', { spaceName: spaceName || '…' });
  const searchHint = isOrganization
    ? t('inviteMembers.dialog.organization.searchHint')
    : isVirtualContributor
      ? t('inviteMembers.dialog.virtualContributor.description')
      : t('inviteMembers.dialog.searchHint');
  const searchPlaceholder = isOrganization
    ? t('inviteMembers.dialog.organization.searchPlaceholder')
    : isVirtualContributor
      ? t('inviteMembers.dialog.virtualContributor.searchPlaceholder')
      : t('inviteMembers.dialog.searchPlaceholder');

  return (
    <InviteMembersDialog
      open={open}
      onOpenChange={handleOpenChange}
      kind={kind}
      spaceName={spaceName || '…'}
      selectedContributors={selectedContributors}
      searchResults={searchResults}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelectUser={handleSelectUser}
      onAddEmails={isOrganization || onlyFromParentCommunity ? undefined : handleAddEmails}
      onRemoveContributor={handleRemoveContributor}
      searchLoading={
        (isOrganization ? orgLoading : isVirtualContributor ? vcLoading : contributorsLoading) ||
        loadingSpace ||
        loadingRoleSet
      }
      hasMoreSearchResults={isOrganization ? false : hasMore}
      onLoadMoreSearchResults={isOrganization ? undefined : fetchMore}
      allowEmailInvites={!isOrganization && !onlyFromParentCommunity}
      welcomeMessage={welcomeMessage}
      onWelcomeMessageChange={setWelcomeMessage}
      suggestedLanguage={suggestedLanguage}
      onSuggestedLanguageChange={setSuggestedLanguage}
      availableLanguages={eligibleLanguages}
      extraRoles={extraRoles}
      onExtraRolesChange={setExtraRoles}
      sending={isSending}
      results={results}
      onSend={handleSend}
      onBack={handleBack}
      labels={{
        title,
        searchHint,
        searchPlaceholder,
        searchAriaLabel: t('inviteMembers.dialog.searchAriaLabel'),
        noResultsLabel: t('inviteMembers.dialog.noResultsLabel'),
        loadingLabel: t('inviteMembers.dialog.loadingLabel'),
        loadMoreLabel: t('inviteMembers.dialog.loadMoreLabel'),
        removeAriaLabel: (label: string) => t('inviteMembers.dialog.removeAriaLabel', { label }),
        validationErrorLabel: errKind =>
          errKind === 'invalid' ? t('inviteMembers.errors.invalidEmail') : t('inviteMembers.errors.duplicateEmail'),
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
        resultNoticeLabels: { noAdministrators: t('inviteMembers.results.sentNoAdministrators') },
        suggestedLanguageLabel: t('inviteMembers.dialog.suggestedLanguageLabel'),
        suggestedLanguagePlaceholder: t('inviteMembers.dialog.suggestedLanguagePlaceholder'),
        // Reuse the placeholder text ("No preference") for the explicit reset option in the Select.
        suggestedLanguageNoPreferenceLabel: t('inviteMembers.dialog.suggestedLanguagePlaceholder'),
      }}
      vcAccountItems={vcAccountItems}
      vcLibraryItems={vcLibraryItems}
      onAddAccountVc={handleAddAccountVc}
      onInviteLibraryVc={handleInviteLibraryVc}
      vcBusyId={vcBusyId}
      vcDefaultWelcomeMessage={t('inviteMembers.dialog.virtualContributor.defaultWelcomeMessage', {
        space: spaceName,
      })}
      libraryOnly={libraryOnly}
      vcPreviewData={vcPreviewData}
      onPreviewVc={handlePreviewVc}
      onClosePreviewVc={() => setVcPreviewData(undefined)}
      vcLabels={{
        searchPlaceholder: t('inviteMembers.dialog.virtualContributor.searchPlaceholder'),
        loading: t('inviteVc.loading'),
        onAccount: t('inviteMembers.dialog.virtualContributor.onAccount'),
        onAccountEmpty: t('inviteMembers.dialog.virtualContributor.onAccountEmpty'),
        inLibrary: t('inviteMembers.dialog.virtualContributor.inLibrary'),
        inLibraryEmpty: t('inviteMembers.dialog.virtualContributor.inLibraryEmpty'),
        add: t('inviteMembers.dialog.virtualContributor.add'),
        invite: t('inviteMembers.dialog.virtualContributor.invite'),
        addAriaLabel: (name: string) => t('inviteMembers.dialog.virtualContributor.addAriaLabel', { name }),
        inviteAriaLabel: (name: string) => t('inviteMembers.dialog.virtualContributor.inviteAriaLabel', { name }),
        previewAriaLabel: (name: string) => t('inviteVc.previewAriaLabel', { name }),
        back: t('inviteVc.back'),
        welcomeMessageLabel: t('inviteMembers.dialog.virtualContributor.welcomeMessageLabel'),
        welcomeMessagePlaceholder: t('inviteMembers.dialog.virtualContributor.welcomeMessagePlaceholder'),
        sendInvite: t('inviteMembers.dialog.virtualContributor.sendInvite'),
      }}
    />
  );
}
