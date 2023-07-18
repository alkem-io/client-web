import React, { FC } from 'react';
import JourneyPageBanner from '../../../shared/components/PageHeader/JourneyPageBanner';
import { useChallenge } from '../hooks/useChallenge';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { VisualName } from '../../../common/visual/constants/visuals.constants';
import useInnovationHubJourneyBannerRibbon from '../../../platform/InnovationHub/InnovationHubJourneyBannerRibbon/useInnovationHubJourneyBannerRibbon';
import { useSpace } from '../../space/SpaceContext/useSpace';
import ChildJourneyPageBanner from '../../common/ChildJourneyPageBanner/ChildJourneyPageBanner';

const ChallengePageBanner: FC = () => {
  const { profile, spaceNameId } = useSpace();
  const { challenge, loading, spaceId } = useChallenge();
  const visual = getVisualByType(VisualName.BANNER, profile?.visuals);
  const avatar = getVisualByType(VisualName.AVATAR, challenge?.profile.visuals);

  const ribbon = useInnovationHubJourneyBannerRibbon({
    spaceId,
    journeyTypeName: 'space',
  });

  return (
    <ChildJourneyPageBanner
      banner={visual}
      journeyTypeName="challenge"
      journeyAvatar={avatar}
      journeyTags={challenge?.profile.tagset?.tags}
      journeyDisplayName={challenge?.profile.displayName ?? ''}
      journeyTagline={challenge?.profile.tagline ?? ''}
      parentJourneyDisplayName={profile.displayName}
      parentJourneyLocation={{ spaceNameId }}
    />
  );

  return (
    <JourneyPageBanner
      title={profile.displayName}
      tagline={profile.tagline}
      loading={loading}
      bannerUrl={visual?.uri}
      bannerAltText={visual?.alternativeText}
      ribbon={ribbon}
      journeyTypeName="challenge"
      showBreadcrumbs
    />
  );
};

export default ChallengePageBanner;
