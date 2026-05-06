import { useTranslation } from 'react-i18next';
import { SpaceGridCard, type SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { Skeleton } from '@/crd/primitives/skeleton';
import useContributionProvider from '@/domain/community/profile/useContributionProvider/useContributionProvider';
import type { SpaceHostedItem } from '@/domain/space/models/SpaceHostedItem.model';

export type MembershipCardConnectorProps = {
  contribution: SpaceHostedItem;
};

export function MembershipCardConnector({ contribution }: MembershipCardConnectorProps) {
  const { t } = useTranslation('crd-profilePages');
  const { details, loading } = useContributionProvider({ spaceHostedItem: contribution });

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }
  if (!details) {
    return null;
  }

  const profile = details.about.profile;
  const space: SpaceGridCardData = {
    id: contribution.id,
    title: profile.displayName,
    description: profile.tagline ?? null,
    href: profile.url,
    imageUrl: profile.cardBanner?.uri || undefined,
    color: pickColorFromId(contribution.id),
    // Treat missing data as public (the optional flag is `undefined` until the
    // backend explicitly opts in to private content); only `false` means private.
    isPrivate: details.about.isContentPublic === false,
  };

  return (
    <SpaceGridCard
      space={space}
      labels={{
        privacyPrivate: t('common.spacePrivacy.private'),
        privacyPublic: t('common.spacePrivacy.public'),
      }}
    />
  );
}
