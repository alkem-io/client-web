import React, { FC } from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../platform/InnovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import ChildJourneyPageBanner from '../../common/ChildJourneyPageBanner/ChildJourneyPageBanner';
import { useSpace } from '../../space/SpaceContext/useSpace';

const OpportunityPageBanner: FC = () => {
  const { profile } = useSpace();
  const { opportunity, spaceId, spaceNameId, challengeNameId } = useOpportunity();
  const banner = getVisualByType(VisualName.BANNER, profile?.visuals);
  const avatar = getVisualByType(VisualName.AVATAR, opportunity?.profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
    journeyTypeName: 'space',
  });

  return (
    <ChildJourneyPageBanner
      banner={banner}
      ribbon={ribbon}
      journeyTypeName="opportunity"
      journeyAvatar={avatar}
      journeyTags={opportunity?.profile.tagset?.tags}
      journeyDisplayName={opportunity?.profile.displayName ?? ''}
      journeyTagline={opportunity?.profile.tagline ?? ''}
      parentJourneyDisplayName={profile.displayName}
      parentJourneyLocation={{ spaceNameId, challengeNameId }}
    />
  );
};

export default OpportunityPageBanner;
