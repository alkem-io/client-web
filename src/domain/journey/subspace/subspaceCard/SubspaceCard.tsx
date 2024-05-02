import React, { ReactNode } from 'react';
import SpaceChildJourneyCard, {
  SpaceChildJourneyCardProps,
} from '../../common/SpaceChildJourneyCard/SpaceChildJourneyCard';
import { ChallengeIcon } from '../icon/ChallengeIcon';
import CardParentJourneySegment from '../../common/SpaceChildJourneyCard/CardParentJourneySegment';
import { SpaceIcon } from '../../space/icon/SpaceIcon';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import { SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import CardRibbon from '../../../../core/ui/card/CardRibbon';
import { useTranslation } from 'react-i18next';

interface SubspaceCardProps
  extends Omit<SpaceChildJourneyCardProps, 'iconComponent' | 'journeyTypeName' | 'parentSegment'> {
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
      iconComponent={ChallengeIcon}
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
          <JourneyCardGoToButton journeyUri={props.journeyUri} subspace />
        </CardActions>
      }
      bannerOverlay={ribbon}
      {...props}
    />
  );
};

export default SubspaceCard;
