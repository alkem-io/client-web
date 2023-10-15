import React, { FC } from 'react';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import { useSpace } from '../../space/SpaceContext/useSpace';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';

const ChallengePageBanner: FC = () => {
  const { profile: spaceProfile } = useSpace();
  const { challenge, spaceId } = useChallenge();
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
      journeyAvatar={avatar ?? cardImage}
      journeyTags={challenge?.profile.tagset?.tags}
      journeyDisplayName={challenge?.profile.displayName ?? ''}
      journeyTagline={challenge?.profile.tagline ?? ''}
    />
  );
};

export default ChallengePageBanner;
