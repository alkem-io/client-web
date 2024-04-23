import { gutters } from '../../../../../core/ui/grid/utils';
import { JourneyTypeName } from '../../../JourneyTypeName';
import React from 'react';
import journeyIcon from '../../../../shared/components/JourneyIcon/JourneyIcon';
import JourneyAvatar from '../../JourneyAvatar/JourneyAvatar';
import { Visual } from '../../../../common/visual/Visual';
import { PageBannerCardWrapperProps } from '../../../../../core/ui/layout/pageBannerCard/PageBannerCardWrapper';
import PageBannerCardWithVisual from './PageBannerCardWithVisual';

type ChildJourneyTypeName = Exclude<JourneyTypeName, 'space'>;

export interface JourneyPageBannerCardProps extends PageBannerCardWrapperProps {
  journeyTypeName: ChildJourneyTypeName;
  displayName: string;
  tagline: string;
  avatar: Visual | undefined;
  tags: string[] | undefined;
}

const JourneyPageBannerCard = ({
  displayName,
  tagline,
  journeyTypeName,
  avatar,
  ...props
}: JourneyPageBannerCardProps) => {
  const JourneyIcon = journeyIcon[journeyTypeName];

  return (
    <PageBannerCardWithVisual
      visual={<JourneyAvatar src={avatar?.uri} />}
      title={
        <>
          <JourneyIcon fontSize="inherit" sx={{ marginRight: gutters(0.25), verticalAlign: 'bottom' }} />
          {displayName}
        </>
      }
      subtitle={tagline}
      {...props}
    />
  );
};

export default JourneyPageBannerCard;
