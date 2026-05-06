import { SpaceGridCard, type SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { Skeleton } from '@/crd/primitives/skeleton';
import useContributionProvider from '@/domain/community/profile/useContributionProvider/useContributionProvider';
import type { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';

export type MembershipCardConnectorProps = {
  contribution: SpaceHostedItem;
};

export function MembershipCardConnector({ contribution }: MembershipCardConnectorProps) {
  const { details, loading } = useContributionProvider({ spaceHostedItem: contribution });

  if (loading || !details) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  const profile = details.about.profile;
  const space: SpaceGridCardData = {
    id: contribution.id,
    title: profile.displayName,
    description: profile.tagline ?? null,
    href: profile.url,
    imageUrl: profile.cardBanner?.uri || undefined,
    color: pickColorFromId(contribution.id),
    isPrivate: !details.about.isContentPublic,
  };

  return <SpaceGridCard space={space} />;
}
