import { formatDistanceToNow } from 'date-fns';
import type { TFunction } from 'i18next';
import {
  ActorType,
  type OrgPendingApplicationDataFragment,
  type OrgPendingInvitationDataFragment,
} from '@/core/apollo/generated/graphql-schema';
import type { OrgPendingApplicationCardData } from '@/crd/components/dashboard/OrgPendingApplicationCard';
import type { OrgPendingInvitationCardData } from '@/crd/components/dashboard/OrgPendingInvitationCard';
import type { PendingApplicationCardData } from '@/crd/components/dashboard/PendingApplicationCard';
import type { PendingInvitationCardData } from '@/crd/components/dashboard/PendingInvitationCard';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { ApplicationWithMeta, InvitationWithMeta } from '@/domain/community/pendingMembership/PendingMemberships';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { offeredRoleLabelKey } from '@/main/crdPages/topLevelPages/organizationPages/publicProfile/organizationProfileMapper';

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

export const mapHydratedInvitationToCardData = (
  hydrated: InvitationWithMeta,
  t: TFunction
): PendingInvitationCardData => ({
  id: hydrated.id,
  spaceName: hydrated.space.about.profile.displayName,
  spaceAvatarUrl: hydrated.space.about.profile.cardBanner?.uri,
  senderName: hydrated.userDisplayName ?? '',
  organizationName:
    hydrated.invitation.actor?.type === ActorType.Organization
      ? hydrated.invitation.actor.profile?.displayName
      : undefined,
  welcomeMessageExcerpt: hydrated.invitation.welcomeMessage
    ? truncate(hydrated.invitation.welcomeMessage, 100)
    : undefined,
  timeElapsed: formatTimeElapsed(hydrated.invitation.createdDate, t),
  color: pickColorFromId(hydrated.space.id),
});

export const mapHydratedApplicationToCardData = (hydrated: ApplicationWithMeta): PendingApplicationCardData => ({
  id: hydrated.id,
  spaceName: hydrated.space.about.profile.displayName,
  spaceAvatarUrl: hydrated.space.about.profile.cardBanner?.uri,
  tagline: hydrated.space.about.profile.tagline,
  spaceHref: hydrated.space.about.profile.url,
  color: pickColorFromId(hydrated.space.id),
});

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

export const mapOrgInvitationToCardData = (
  item: OrgPendingInvitationDataFragment,
  t: LooseTranslator
): OrgPendingInvitationCardData => ({
  id: item.id,
  organizationName: item.organization.profile?.displayName ?? '',
  organizationAvatarUrl: item.organization.profile?.avatar?.uri,
  offeredRoleLabel: t(ORG_ROLE_LABEL_KEY[offeredRoleLabelKey(item.invitation.extraRoles)]),
  timeElapsed: formatTimeElapsed(item.invitation.createdDate, t as TFunction),
  color: pickColorFromId(item.organization.id),
});

export const mapOrgApplicationToCardData = (
  item: OrgPendingApplicationDataFragment
): OrgPendingApplicationCardData => ({
  id: item.id,
  organizationName: item.organization.profile?.displayName ?? '',
  organizationAvatarUrl: item.organization.profile?.avatar?.uri,
  organizationHref: item.organization.profile?.url ?? '',
  color: pickColorFromId(item.organization.id),
});
