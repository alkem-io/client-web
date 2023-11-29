import React from 'react';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { Avatar, Paper } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { Visual } from '../../../../domain/common/visual/Visual';
import withElevationOnHover from '../../../../domain/shared/components/withElevationOnHover';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { JourneyTypeName } from '../../../../domain/journey/JourneyTypeName';
import JourneyIcon from '../../../../domain/shared/components/JourneyIcon/JourneyIcon';
import BlockTitleWithIcon from '../../../../core/ui/content/BlockTitleWithIcon';

interface MyMembershipsChildJourneyCardProps {
  journey: {
    profile: {
      url: string;
      displayName: string;
      tagline: string;
      avatar?: Visual;
    };
  };
  deepness?: number;
  journeyTypeName: JourneyTypeName;
}

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const MyMembershipsChildJourneyCard = ({
  journey,
  journeyTypeName,
  deepness = journeyTypeName === 'challenge' ? 0 : 1,
}: MyMembershipsChildJourneyCardProps) => {
  const Icon = JourneyIcon[journeyTypeName];

  return (
    <ElevatedPaper
      component={RouterLink}
      to={journey.profile.url}
      loose
      sx={{ padding: gutters(), marginLeft: gutters(deepness * 2) }}
    >
      <BadgeCardView
        visual={
          <Avatar src={journey.profile.avatar?.uri} sx={{ borderRadius: 0.5, width: gutters(3), height: gutters(3) }} />
        }
      >
        <BlockTitleWithIcon title={journey.profile.displayName} icon={<Icon />} sx={{ height: gutters(1.5) }} />
        <Caption noWrap component="div" lineHeight={gutters(1.5)}>
          {journey.profile.tagline}
        </Caption>
      </BadgeCardView>
    </ElevatedPaper>
  );
};

export default MyMembershipsChildJourneyCard;
