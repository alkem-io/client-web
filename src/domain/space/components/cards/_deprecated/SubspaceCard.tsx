import { ReactNode } from 'react';
import SpaceChildJourneyCard, {
  SpaceChildJourneyCardProps,
} from '@/domain/space/components/cards/_deprecated/SpaceSubspaceCard2/SpaceChildJourneyCard';
import { SubspaceIcon } from '../../../icons/SubspaceIcon';
import CardParentJourneySegment from '@/domain/space/components/cards/_deprecated/SpaceSubspaceCard2/CardParentJourneySegment';
import { SpaceIcon } from '@/domain/space/icons/SpaceIcon';
import CardActions from '@/core/ui/card/CardActions';
import SpaceCardGoToButton from '@/domain/space/components/cards/components/SpaceCardGoToButton';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import CardRibbon from '@/core/ui/card/CardRibbon';
import { useTranslation } from 'react-i18next';

interface SubspaceCardProps extends Omit<SpaceChildJourneyCardProps, 'iconComponent' | 'parentSegment'> {
  tagline: string;
  spaceUri?: string;
  spaceDisplayName?: ReactNode;
  spaceVisibility?: SpaceVisibility;
  journeyUri: string;
}

/**
 * @deprecated
 * This is the old ChallengeCard. We need to review the usage of those cards and maybe replace them with new ones,
 * such as SpaceSubspaceCard.
 */
const SubspaceCard = ({ spaceDisplayName, spaceUri, spaceVisibility, ...props }: SubspaceCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    spaceVisibility === SpaceVisibility.Archived ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  return (
    <SpaceChildJourneyCard
      iconComponent={SubspaceIcon}
      parentSegment={
        spaceUri &&
        spaceDisplayName && (
          <CardParentJourneySegment iconComponent={SpaceIcon} parentJourneyUri={spaceUri}>
            {spaceDisplayName}
          </CardParentJourneySegment>
        )
      }
      expansionActions={
        <CardActions>
          <SpaceCardGoToButton spaceUri={props.journeyUri} subspace />
        </CardActions>
      }
      bannerOverlay={ribbon}
      {...props}
    />
  );
};

export default SubspaceCard;
