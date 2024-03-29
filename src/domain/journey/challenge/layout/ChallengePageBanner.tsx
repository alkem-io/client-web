import React from 'react';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import { useSpace } from '../../space/SpaceContext/useSpace';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';
import { BasePageBannerProps } from '../../common/EntityPageLayout/EntityPageLayoutTypes';

const ChallengePageBanner = (props: BasePageBannerProps) => {
  const { profile: spaceProfile, spaceId } = useSpace();
  const { challenge } = useChallenge();
  const banner = getVisualByType(VisualName.BANNER, spaceProfile?.visuals);
  const avatar = getVisualByType(VisualName.AVATAR, challenge?.profile.visuals);
  const cardImage = getVisualByType(VisualName.CARD, challenge?.profile.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
    journeyTypeName: 'space',
  });

  return (
    <ChildJourneyPageBanner
      banner={banner}
      ribbon={ribbon}
      journeyTypeName="challenge"
      avatar={avatar ?? cardImage}
      tags={challenge?.profile.tagset?.tags}
      displayName={challenge?.profile.displayName ?? ''}
      tagline={challenge?.profile.tagline ?? ''}
      {...props}
    />
  );
};

export default ChallengePageBanner;
