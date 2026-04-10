import type { TFunction } from 'i18next';
import type { PendingApplicationCardData } from '@/crd/components/dashboard/PendingApplicationCard';
import type { PendingInvitationCardData } from '@/crd/components/dashboard/PendingInvitationCard';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import type { ApplicationWithMeta, InvitationWithMeta } from '@/domain/community/pendingMembership/PendingMemberships';
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

export const mapHydratedInvitationToCardData = (
  hydrated: InvitationWithMeta,
  t: TFunction
): PendingInvitationCardData => ({
  id: hydrated.id,
  spaceName: hydrated.space.about.profile.displayName,
  spaceAvatarUrl: hydrated.space.about.profile.cardBanner?.uri,
  senderName: hydrated.userDisplayName ?? '',
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
  t: TFunction
): InvitationDetailData => ({
  spaceName: hydrated.space.about.profile.displayName,
  spaceAvatarUrl: hydrated.space.about.profile.cardBanner?.uri,
  spaceTagline: hydrated.space.about.profile.tagline,
  spaceTags: hydrated.space.about.profile.tagset?.tags ?? [],
  spaceHref: hydrated.space.about.profile.url,
  senderName: hydrated.userDisplayName ?? '',
  timeElapsed: formatTimeElapsed(hydrated.invitation.createdDate, t),
  color: pickColorFromId(hydrated.space.id),
});

export type { InvitationDetailData };
