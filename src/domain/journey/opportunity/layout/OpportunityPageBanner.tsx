import React from 'react';
import { useOpportunity } from '../hooks/useOpportunity';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../innovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import ChildJourneyPageBanner from '../../common/childJourneyPageBanner/ChildJourneyPageBanner';
import { useSpace } from '../../space/SpaceContext/useSpace';
import { BasePageBannerProps } from '../../common/EntityPageLayout/EntityPageLayoutTypes';

const OpportunityPageBanner = (props: BasePageBannerProps) => {
  const { profile: spaceProfile } = useSpace();
  const { opportunity, spaceId } = useOpportunity();
  const banner = getVisualByType(VisualName.BANNER, spaceProfile?.visuals);
  const avatar = getVisualByType(VisualName.AVATAR, opportunity?.profile?.visuals);
  const cardImage = getVisualByType(VisualName.CARD, opportunity?.profile?.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
    journeyTypeName: 'space',
  });

  return (
    <ChildJourneyPageBanner
      banner={banner}
      ribbon={ribbon}
      journeyTypeName="opportunity"
      avatar={avatar ?? cardImage}
      tags={opportunity?.profile.tagset?.tags}
      displayName={opportunity?.profile.displayName ?? ''}
      tagline={opportunity?.profile.tagline ?? ''}
      {...props}
    />
  );
};

export default OpportunityPageBanner;
