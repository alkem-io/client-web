import { formatDistanceToNow } from 'date-fns';
import type { TFunction } from 'i18next';
import { RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import type { OrgPendingApplicationCardData } from '@/crd/components/dashboard/OrgPendingApplicationCard';
import type { OrgPendingInvitationCardData } from '@/crd/components/dashboard/OrgPendingInvitationCard';
import type { PendingApplicationCardData } from '@/crd/components/dashboard/PendingApplicationCard';
import type { PendingInvitationCardData } from '@/crd/components/dashboard/PendingInvitationCard';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type {
  InvitationWithMeta,
  PendingMembershipRequest,
} from '@/domain/community/pendingMembership/PendingMemberships';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';

type InvitationDetailData = {
  spaceName: string;
  spaceAvatarUrl?: string;
  spaceTagline?: string;
  spaceTags: string[];
  spaceHref: string;
  senderName: string;
  timeElapsed: string;
  color: string;
};

const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;

type PendingSpace = NonNullable<PendingMembershipRequest['space']>;

/** A Space request carries its space (MembershipRequest.space); without it the request is not a Space card. */
export const requestSpace = (request: PendingMembershipRequest): PendingSpace => {
  if (!request.space) throw new Error(`Membership request ${request.id} names no space`);
  return request.space;
};

const requireUrl = (space: PendingSpace): string => {
  if (!space.url) throw new Error(`Pending space ${space.id} has no canonical destination`);
  return space.url;
};

/** The organization a request is addressed to (MembershipRequest.resource, entityType organization). */
type OrganizationResource = {
  id: string;
  url?: string | null;
  about: { displayName: string; avatar?: { file: { url: string } } | null };
};

export const requestOrganization = (request: PendingMembershipRequest): OrganizationResource => {
  if (request.resource.entityType !== 'organization') {
    throw new Error(`Membership request ${request.id} is not addressed to an organization`);
  }
  return request.resource as OrganizationResource;
};

export const mapPendingInvitationToCardData = (
  invitation: PendingMembershipRequest,
  t: TFunction
): PendingInvitationCardData => {
  const space = requestSpace(invitation);
  return {
    id: invitation.id,
    spaceName: space.about.displayName,
    spaceAvatarUrl: space.about.card?.file.url,
    senderName: invitation.createdBy?.about?.displayName ?? '',
    organizationName: invitation.actor?.actorType === 'organization' ? invitation.actor.about?.displayName : undefined,
    welcomeMessageExcerpt: invitation.message ? truncate(invitation.message, 100) : undefined,
    timeElapsed: formatTimeElapsed(invitation.createdAt, t),
    color: pickColorFromId(space.id),
  };
};

export const mapPendingApplicationToCardData = (application: PendingMembershipRequest): PendingApplicationCardData => {
  const space = requestSpace(application);
  return {
    id: application.id,
    spaceName: space.about.displayName,
    spaceAvatarUrl: space.about.card?.file.url,
    tagline: space.about.tagline ?? undefined,
    spaceHref: requireUrl(space),
    color: pickColorFromId(space.id),
  };
};

export const mapPendingInvitationToDetailData = (
  invitation: PendingMembershipRequest,
  language: string
): InvitationDetailData => {
  const space = requestSpace(invitation);
  return {
    spaceName: space.about.displayName,
    spaceAvatarUrl: space.about.card?.file.url,
    spaceTagline: space.about.tagline ?? undefined,
    spaceTags: space.tags,
    spaceHref: requireUrl(space),
    senderName: invitation.createdBy?.about?.displayName ?? '',
    timeElapsed: formatDistanceToNow(new Date(invitation.createdAt), {
      addSuffix: true,
      locale: resolveDateFnsLocale(language),
    }),
    color: pickColorFromId(space.id),
  };
};

/** The legacy hydrated invitation's detail (space About page, InvitationDetailConnector). */
export const mapHydratedInvitationToDetailData = (
  hydrated: InvitationWithMeta,
  language: string
): InvitationDetailData => ({
  spaceName: hydrated.space.about.profile.displayName,
  spaceAvatarUrl: hydrated.space.about.profile.cardBanner?.uri,
  spaceTagline: hydrated.space.about.profile.tagline,
  spaceTags: hydrated.space.about.profile.tagset?.tags ?? [],
  spaceHref: hydrated.space.about.profile.url,
  senderName: hydrated.userDisplayName ?? '',
  timeElapsed: formatDistanceToNow(new Date(hydrated.invitation.createdDate), {
    addSuffix: true,
    locale: resolveDateFnsLocale(language),
  }),
  color: pickColorFromId(hydrated.space.id),
});

export type { InvitationDetailData };

type OfferedRoleLabelKey = 'associate' | 'associateAdmin' | 'associateOwner';

/** The offered organization role beyond associate, from the request's roles (native role names). */
export const offeredOrganizationRoleKey = (roles: readonly string[]): OfferedRoleLabelKey => {
  if (roles.includes(RoleName.Admin)) return 'associateAdmin';
  if (roles.includes(RoleName.Owner)) return 'associateOwner';
  return 'associate';
};

const ORG_ROLE_LABEL_KEY = {
  associate: 'pendingMemberships.orgAssociateCard.role.associate',
  associateAdmin: 'pendingMemberships.orgAssociateCard.role.associateAdmin',
  associateOwner: 'pendingMemberships.orgAssociateCard.role.associateOwner',
} as const;

/**
 * Loosely-typed translator shape, deliberately NOT `TFunction`: the literal-key overload
 * set i18next's strict typing builds (now grown further by this feature's own new keys)
 * pushes TypeScript's generic instantiation past its depth limit on this call chain. The
 * caller always passes a real `TFunction`, which is structurally a superset of this.
 */
type LooseTranslator = (key: string, options?: Record<string, unknown>) => string;

/**
 * `t` resolves this card's own `crd-dashboard` keys; `tCommon` resolves the shared
 * `crd-common` ones. They are separate parameters because `formatTimeElapsed` reads
 * `common.time.short.*`, which lives ONLY in `crd-common`, and i18next is configured
 * without `fallbackNS` — passing the `crd-dashboard` translator for both renders the
 * raw key instead of "3d ago" (the Space cards get this right by using the default
 * namespace, see `HydratedInvitationCard`).
 */
export const mapOrgInvitationToCardData = (
  item: PendingMembershipRequest,
  t: LooseTranslator,
  tCommon: LooseTranslator
): OrgPendingInvitationCardData => {
  const organization = requestOrganization(item);
  return {
    id: item.id,
    organizationName: organization.about.displayName,
    organizationAvatarUrl: organization.about.avatar?.file.url,
    offeredRoleLabel: t(ORG_ROLE_LABEL_KEY[offeredOrganizationRoleKey(item.roles)]),
    timeElapsed: formatTimeElapsed(item.createdAt, tCommon as TFunction),
    color: pickColorFromId(organization.id),
  };
};

export const mapOrgApplicationToCardData = (item: PendingMembershipRequest): OrgPendingApplicationCardData => {
  const organization = requestOrganization(item);
  return {
    id: item.id,
    organizationName: organization.about.displayName,
    organizationAvatarUrl: organization.about.avatar?.file.url,
    organizationHref: organization.url ?? '',
    color: pickColorFromId(organization.id),
  };
};
