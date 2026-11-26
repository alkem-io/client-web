import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { RoleSetInvitationResultNotice, RoleSetInvitationResultType } from '@/core/apollo/generated/graphql-schema';
import {
  useSpaceCommunityCandidatesQuery,
  useSpaceCommunityInviteTargetQuery,
} from '@/core/apollo/generated-v2/apollo-hooks';
import { CandidateEntry, type InviteOutcomeKind } from '@/core/apollo/generated-v2/graphql-schema';
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
import type InvitationResultModel from '@/domain/access/model/InvitationResultModel';
import emailParser from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/emailParser';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useConfig } from '@/domain/platform/config/useConfig';
import useVirtualContributorsAdmin from '@/domain/spaceAdmin/SpaceAdminCommunity/hooks/useVirtualContributorsAdmin';
import {
  ACTOR_TYPE,
  SPACE_ROLE,
  type SpaceCommunityCandidate,
  type SpaceCommunityInviteOutcome,
  toSpaceCommunityCandidate,
  useSpaceCommunityMutations,
} from '@/domain/spaceAdmin/SpaceAdminCommunity/native/spaceCommunityNative';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export type InviteMembersDialogConnectorProps = {
  open: boolean;
  onClose: () => void;
  /** Who is being invited. Defaults to 'user' — the original behaviour of this connector. */
  kind?: InviteKind;
  /**
   * When true, only existing parent-community members can be invited and the
   * email-paste path is hidden. Mirrors the legacy `InviteContributorsDialog`
   * `onlyFromParentCommunity` behaviour. User kind only. The server's INVITE
   * candidates already admit only parent members there (invite-candidates,
   * community-roles-screens.tsv:173); the flag keeps the email path hidden.
   */
  onlyFromParentCommunity?: boolean;
  /**
   * Override the URL-resolved space. Required when the dialog is opened from
   * (sub)space settings, where the route may resolve to a parent space but the
   * invite must target the (sub)space being edited.
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
 * Correlates the legacy `inviteForEntryRoleOnRoleSet` per-invitee results back to what was
 * submitted. Still used by the organization Associates invite connector, which is not
 * repointed; the space invite below maps the native `InviteOutcome` list with
 * `mapInviteOutcomes`.
 *
 * Every result carries the invitee's identity — `invitedActorID` for an actor
 * (and for an email address that turned out to belong to an existing user),
 * `invitedEmail` for anything submitted as an email — so the match is exact
 * and independent of ordering. That matters because the server moves an email
 * that resolves to an existing user out of the email group and into the actor
 * group, which breaks any assumption that results come back in input order,
 * and because typed failures (opt-out, Lead limit, already member, ...) create
 * neither an `invitation` nor a `platformInvitation` to match on.
 *
 * The legacy fallbacks below (match on the created entity, then consume the
 * next identity-less result positionally) are kept only for a server that
 * predates those fields; they are unreachable against a current server. The
 * positional fallback never claims a result that carries any identity or
 * created entity: such a result belongs to the chip it names, so a chip that
 * matched nothing reports an error instead of borrowing another invitee's
 * outcome. The server echoes one result per submitted chip, so an address
 * typed for a person who is also picked gets its own result (sharing the same
 * invitation) and reports the same outcome as the picked chip.
 * Exported for unit testing (T007).
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
    const inviteeActorId =
      invitee.kind === 'organization' ? invitee.id : invitee.kind === 'user' ? invitee.userId : undefined;
    const inviteeEmail = invitee.kind === 'email' ? invitee.email.toLowerCase() : undefined;

    // Exact identity match first — see the docblock.
    const identityMatched =
      inviteeActorId !== undefined
        ? take(r => r.invitedActorID === inviteeActorId)
        : inviteeEmail !== undefined
          ? take(r => r.invitedEmail?.toLowerCase() === inviteeEmail)
          : undefined;

    const matched =
      identityMatched ??
      (invitee.kind === 'organization'
        ? take(r => r.invitation?.actor?.id === invitee.id)
        : invitee.kind === 'user'
          ? take(r => r.invitation?.actor?.id === invitee.userId)
          : invitee.kind === 'email'
            ? take(r => r.platformInvitation?.email?.toLowerCase() === invitee.email.toLowerCase())
            : undefined);
    const legacyResult =
      matched ?? take(r => !r.invitedActorID && !r.invitedEmail && !r.invitation && !r.platformInvitation);
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
                    : legacyResult.type === RoleSetInvitationResultType.ExtraRoleLimitReached
                      ? 'extraRoleLimitReached'
                      : 'error';
    const notice: InvitationResult['notice'] =
      legacyResult.notice === RoleSetInvitationResultNotice.OrganizationHasNoAdministrators
        ? 'noAdministrators'
        : undefined;
    return notice ? { invitee, outcome, notice } : { invitee, outcome };
  });
};

/**
 * The C2.2 outcome vocabulary (InviteOutcomeKind) onto the dialog's result rows. NOT_ALLOWED and
 * ROLE_LIMIT_REACHED have no dedicated result copy, so they render as the generic failure row.
 */
const INVITE_OUTCOME_RESULT: Record<InviteOutcomeKind, InvitationResult['outcome']> = {
  SENT: 'sent',
  ALREADY_INVITED: 'alreadyInvited',
  ALREADY_MEMBER: 'alreadyMember',
  OPEN_APPLICATION: 'alreadyHasApplication',
  PARENT_NOT_AUTHORIZED: 'parentNotAuthorized',
  ORGANIZATION_NOT_ACCEPTING_INVITATIONS: 'notAcceptingInvitations',
  ORGANIZATION_LEAD_ROLE_LIMIT_REACHED: 'leadLimitReached',
  EXTRA_ROLE_LIMIT_REACHED: 'extraRoleLimitReached',
  NOT_ALLOWED: 'error',
  ROLE_LIMIT_REACHED: 'error',
};

/**
 * Correlates the native `invite` outcomes (invite-send, community-roles-screens.tsv:174) back to
 * the submitted chips. Exactly one of `actor` / `email` names each outcome, so the match is by
 * identity and independent of ordering; a chip no outcome names reports an error.
 * `noOrganizationAdmin` is the inviter advisory rendered as the `noAdministrators` notice.
 */
export const mapInviteOutcomes = (
  submittedInvitees: ContributorSelectorInvitee[],
  outcomes: SpaceCommunityInviteOutcome[]
): InvitationResult[] => {
  const remaining = [...outcomes];
  return submittedInvitees.map(invitee => {
    const actorId = invitee.kind === 'organization' ? invitee.id : invitee.kind === 'user' ? invitee.userId : undefined;
    const email = invitee.kind === 'email' ? invitee.email.toLowerCase() : undefined;
    const index = remaining.findIndex(result =>
      actorId !== undefined ? result.actor === actorId : result.email?.toLowerCase() === email
    );
    if (index === -1 || (actorId === undefined && email === undefined)) {
      return { invitee, outcome: 'error' as const };
    }
    const [result] = remaining.splice(index, 1);
    const outcome = INVITE_OUTCOME_RESULT[result.outcome];
    return result.noOrganizationAdmin
      ? { invitee, outcome, notice: 'noAdministrators' as const }
      : { invitee, outcome };
  });
};

const SEARCH_DEBOUNCE_MS = 300;
const INVITE_PAGE_SIZE = 20;

// Match the regex used by the legacy validation layer (FormikContributorsSelectorField.validation).
// Inlined here to avoid coupling the CRD connector to a Yup schema we don't otherwise use.
const EMAIL_REGEX =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?$/i;
// Shared with the organization invite connector so both dialogs accept exactly what the server's
// @IsEmail accepts and flag the rest as invalid chips instead of failing the whole batch.
export const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim().toLowerCase());

// The offered roles, as the server's role names (schema.sql:84-90).
const ROLE_TO_NAME: Record<InviteRole, string> = {
  Member: SPACE_ROLE.Member,
  Lead: SPACE_ROLE.Lead,
  Admin: SPACE_ROLE.Admin,
  // Associate/Owner are never offered on a Space-target invite (organization target only,
  // 062) — the shared role type is exhaustive, so this map needs an entry even though these
  // two are unreachable here.
  Associate: 'associate',
  Owner: 'owner',
};

/**
 * Wires the CRD `InviteMembersDialog` to the native space community reads and writes
 * (`candidates`, `invite`, `setRoles`) and the existing email parser. Owns ALL i18n resolution
 * so the presentational layer stays label-free.
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
  const { spaceId: resolvedSpaceId } = useUrlResolver();
  const spaceId = spaceIdOverride ?? resolvedSpaceId;
  const { userModel: currentUser } = useCurrentUserContext();

  // T013 — eligible language set for the suggested-language select control.
  const { language: languageConfig } = useConfig();
  const eligibleLanguages = (languageConfig?.eligible ?? []).map(code => ({
    code,
    // biome-ignore lint/suspicious/noExplicitAny: dynamic key — code is an eligible language code from server config
    label: String((i18n as any).t(`languages.${code}`)),
  }));

  const { data: spaceData, loading: loadingSpace } = useSpaceCommunityInviteTargetQuery({
    variables: { space: spaceId ?? '' },
    skip: !open || !spaceId,
  });

  const target = spaceData?.node;
  const spaceName = target && 'about' in target ? target.about.displayName : '';

  const { invite, setRoles } = useSpaceCommunityMutations(spaceId ?? '');

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
    // Only `=== defaultMessage`. The extra `welcomeMessage === ''` arm made the
    // box unclearable: deleting the last character re-ran this effect with an
    // empty value and immediately refilled the default. `resetDialogState()`
    // clears both on close, so a reopen still starts from '' === '' and
    // prefills; a later space-name resolution still refills an untouched
    // default; and an emptied box is now respected as the deliberate edit it
    // is.
    if (welcomeMessage === defaultMessage) {
      setWelcomeMessage(next);
    }
    setDefaultMessage(next);
  }, [open, spaceName, kind, t, welcomeMessage, defaultMessage]);

  // Debounce the search query so we don't fire a candidates read on every
  // keystroke. 300ms matches the legacy debounce.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  // ---------- user / organization candidates ----------
  // `candidates(entry: INVITE)` (invite-candidates, community-roles-screens.tsv:173): the server
  // admits the invitable set for this space — current holders, open requests, directly grantable
  // actors and (on an L2 space) non-parent-members are filtered before paging, never in the client.
  // Trim once: a pasted value with surrounding whitespace must not gate `skip` as
  // non-empty while leaking the whitespace into the server-side filter.
  const trimmedQuery = debouncedQuery.trim();
  const isOrganization = kind === 'organization';
  const isVirtualContributor = kind === 'virtualContributor';

  const {
    data: candidatesData,
    loading: candidatesLoading,
    fetchMore: candidatesFetchMore,
  } = useSpaceCommunityCandidatesQuery({
    variables: {
      space: spaceId ?? '',
      role: SPACE_ROLE.Member,
      entry: CandidateEntry.Invite,
      actorType: isOrganization ? ACTOR_TYPE.Organization : ACTOR_TYPE.User,
      terms: trimmedQuery || undefined,
      first: INVITE_PAGE_SIZE,
    },
    // Users are searched once something is typed (the parent-members list at L2 also
    // without); organizations are listed from the start — as before the repoint.
    skip: !open || !spaceId || isVirtualContributor || (!isOrganization && !onlyFromParentCommunity && !trimmedQuery),
  });
  const candidatesPage = candidatesData?.candidates;
  const hasMore = candidatesPage?.pageInfo.hasNextPage ?? false;
  const fetchMore = () => {
    const after = candidatesPage?.pageInfo.endCursor;
    if (!candidatesPage?.pageInfo.hasNextPage || !after) return;
    void candidatesFetchMore({
      variables: { after },
      updateQuery: (previous, { fetchMoreResult }) => ({
        ...fetchMoreResult,
        candidates: {
          ...fetchMoreResult.candidates,
          edges: [...previous.candidates.edges, ...fetchMoreResult.candidates.edges],
        },
      }),
    });
  };

  // Exclude self + already-selected chips (dialog state, not admission).
  const selectedIds = new Set(
    selectedContributors.flatMap(c => (c.kind === 'user' ? [c.userId] : c.kind === 'organization' ? [c.id] : []))
  );
  const searchResults: ContributorSelectorUserResult[] = (candidatesPage?.edges ?? [])
    .map(edge => toSpaceCommunityCandidate(edge.node))
    .filter(c => isOrganization || c.id !== currentUser?.id)
    .filter(c => !selectedIds.has(c.id))
    .map(c =>
      isOrganization
        ? { userId: c.id, displayName: c.displayName }
        : { userId: c.id, displayName: c.displayName, avatarUrl: c.avatarUrl, location: c.location }
    );

  // ---------- virtualContributor candidates (T019 fold) ----------
  // Account VCs = `candidates(entry: DIRECT)` (added with `setRoles`), library VCs =
  // `candidates(entry: INVITE)` (invited with `invite`); the server keeps the two verdicts apart.
  const { virtualContributorAdmin: vcLookup } = useVirtualContributorsAdmin({ spaceId: spaceId ?? '' });
  const [vcAccountItems, setVcAccountItems] = useState<VcInviteItem[]>([]);
  const [vcLibraryItems, setVcLibraryItems] = useState<VcInviteItem[]>([]);
  const [vcFetchedItems, setVcFetchedItems] = useState<SpaceCommunityCandidate[]>([]);
  const [vcLoading, setVcLoading] = useState(false);
  const [vcBusyId, setVcBusyId] = useState<string | null>(null);
  const [vcPreviewData, setVcPreviewData] = useState<VcPreviewData | undefined>(undefined);
  const toVcItem = (vc: SpaceCommunityCandidate): VcInviteItem => ({
    id: vc.id,
    displayName: vc.displayName,
    avatarUrl: vc.avatarUrl,
  });
  const toVcPreviewData = (vc: SpaceCommunityCandidate): VcPreviewData => ({
    id: vc.id,
    displayName: vc.displayName,
    avatarUrl: vc.avatarUrl,
    tags: vc.tags,
    description: vc.description ?? '',
  });
  // `vcLookup` is intentionally excluded from deps — it returns a fresh object every render.
  useEffect(() => {
    if (!open || !isVirtualContributor || !spaceId) return;
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
      } catch {
        // A failed lookup must render as "no results", not as an unhandled rejection
        // that leaves the previous query's candidates on screen once the spinner clears.
        if (!cancelled) {
          setVcAccountItems([]);
          setVcLibraryItems([]);
          setVcFetchedItems([]);
        }
      } finally {
        if (!cancelled) setVcLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isVirtualContributor, libraryOnly, trimmedQuery, spaceId]);

  // direct-add-vc (community-roles-screens.tsv:167). A DIRECT candidate holds no community role
  // (current member holders are not candidates and lead/admin require member), so its exact
  // desired set is the member role alone.
  const handleAddAccountVc = async (id: string) => {
    setVcBusyId(id);
    try {
      await setRoles(id, [SPACE_ROLE.Member]);
      notify(t('inviteMembers.dialog.virtualContributor.addedNotice'), 'success');
      closeAndReset();
    } catch {
      notify(t('inviteMembers.dialog.virtualContributor.error'), 'error');
    } finally {
      setVcBusyId(null);
    }
  };

  const handleInviteLibraryVc = async (id: string, message: string) => {
    setVcBusyId(id);
    try {
      const [outcome] = await invite({ actors: [id], message });
      if (outcome?.outcome !== 'SENT') {
        notify(t('inviteMembers.dialog.virtualContributor.error'), 'error');
        return;
      }
      notify(t('inviteMembers.dialog.virtualContributor.invitedNotice'), 'success');
      closeAndReset();
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
    // Never rendered on a Space-target invite (organization target only, 062) — the shared
    // outcome type is exhaustive, so this row needs a value even though it is unreachable here.
    extraRoleLimitReached: t('inviteMembers.results.extraRoleLimitReached'),
    error: t('inviteMembers.results.error'),
  } satisfies Record<InvitationResult['outcome'], string>;

  const handleSend = () => {
    if (!spaceId) return;
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
        // invite-send (community-roles-screens.tsv:174).
        const outcomes = await invite({
          actors: invitedContributorIds,
          emails: invitedUserEmails,
          message: welcomeMessage,
          roles: extraRoles.map(role => ROLE_TO_NAME[role]),
          // T013: only include when the host explicitly chose a language (FR-015).
          language: suggestedLanguage,
        });
        const built = mapInviteOutcomes(validInvitees, outcomes);
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

  /**
   * Every piece of state the next open must not inherit. Extracted so that the
   * two paths out of this dialog cannot diverge: `handleOpenChange(false)` (the
   * X, Escape, backdrop) and the virtual-contributor success handlers, which
   * call `onClose()` directly and therefore never run `onOpenChange`. The VC
   * preview reset was carried over from `VirtualContributorInviteConnector` and
   * initially put in `handleOpenChange` alone, which left the add-account and
   * invite-library paths inheriting it — the same half-fix the fold-in made in
   * the first place.
   */
  const resetDialogState = () => {
    setSelectedContributors([]);
    setSearchQuery('');
    setDebouncedQuery('');
    setWelcomeMessage('');
    setDefaultMessage('');
    setExtraRoles(['Member']);
    setSuggestedLanguage(undefined);
    setResults(undefined);
    setVcPreviewData(undefined);
  };

  const closeAndReset = () => {
    resetDialogState();
    onClose();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      closeAndReset();
    }
  };

  // ---------- render ----------
  // spaceName empty → title shows the placeholder ("…").
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
  // The search affordances name what is being searched for, so they branch on
  // kind like the three labels above. Left shared, an organization admin was
  // told "No matching users" / "Loading users…" and screen readers announced
  // "Search for users by name or email" in a dialog that searches nothing but
  // organizations.
  const searchAriaLabel = isOrganization
    ? t('inviteMembers.dialog.organization.searchAriaLabel')
    : isVirtualContributor
      ? t('inviteMembers.dialog.virtualContributor.searchAriaLabel')
      : t('inviteMembers.dialog.searchAriaLabel');
  const noResultsLabel = isOrganization
    ? t('inviteMembers.dialog.organization.noResultsLabel')
    : isVirtualContributor
      ? t('inviteMembers.dialog.virtualContributor.noResultsLabel')
      : t('inviteMembers.dialog.noResultsLabel');
  const loadingLabel = isOrganization
    ? t('inviteMembers.dialog.organization.loadingLabel')
    : isVirtualContributor
      ? t('inviteMembers.dialog.virtualContributor.loadingLabel')
      : t('inviteMembers.dialog.loadingLabel');

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
      searchLoading={(isVirtualContributor ? vcLoading : candidatesLoading) || loadingSpace}
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
        searchAriaLabel,
        noResultsLabel,
        loadingLabel,
        loadMoreLabel: t('inviteMembers.dialog.loadMoreLabel'),
        removeAriaLabel: (label: string) => t('inviteMembers.dialog.removeAriaLabel', { label }),
        validationErrorLabel: errKind =>
          errKind === 'invalid' ? t('inviteMembers.errors.invalidEmail') : t('inviteMembers.errors.duplicateEmail'),
        welcomeMessageLabel: t('inviteMembers.dialog.welcomeMessageLabel'),
        welcomeMessagePlaceholder: t('inviteMembers.dialog.welcomeMessagePlaceholder'),
        // Users only. Before the CRD rewrite hoisted it to a shared label this
        // copy lived under `inviteContributorsDialog.users.note`; shown on the
        // organization dialog it warns about exposing your personal email in a
        // flow that has no email path at all (FR-009).
        emailVisibilityNote:
          isOrganization || isVirtualContributor ? undefined : t('inviteMembers.dialog.emailVisibilityNote'),
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
        resultsSummary: (count: number) =>
          t('inviteMembers.dialog.resultsSummary', { count, spaceName: spaceName || '…' }),
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
