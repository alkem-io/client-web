import React, { FC } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import ChildJourneyPageBanner from '../../common/ChildJourneyPageBanner/ChildJourneyPageBanner';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { useChallenge } from '../../challenge/hooks/useChallenge';

const OpportunityPageBanner: FC = () => {
  const { profile: spaceProfile } = useSpace();
  const { profile: challengeProfile } = useChallenge();
  const { opportunity, spaceId, spaceNameId, challengeNameId } = useOpportunity();
  const banner = getVisualByType(VisualName.BANNER, spaceProfile?.visuals);
  const avatar = getVisualByType(VisualName.AVATAR, opportunity?.profile?.visuals);
  const cardImage = getVisualByType(VisualName.BANNERNARROW, opportunity?.profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
    journeyTypeName: 'space',
  });

  return (
    <ChildJourneyPageBanner
      banner={banner}
      ribbon={ribbon}
      journeyTypeName="opportunity"
      journeyAvatar={avatar ?? cardImage}
      journeyTags={opportunity?.profile.tagset?.tags}
      journeyDisplayName={opportunity?.profile.displayName ?? ''}
      journeyTagline={opportunity?.profile.tagline ?? ''}
      parentJourneys={[
        {
          displayName: spaceProfile.displayName,
          journeyLocation: { spaceNameId },
          journeyTypeName: 'space',
        },
        {
          displayName: challengeProfile.displayName,
          journeyLocation: { spaceNameId, challengeNameId },
          journeyTypeName: 'challenge',
        },
      ]}
    />
  );
};

export default OpportunityPageBanner;
