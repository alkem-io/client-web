import React from 'react';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { Avatar, Chip, Paper, Typography } from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { Visual } from '../../../common/visual/Visual';
import withElevationOnHover from '../../../shared/components/withElevationOnHover';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { JourneyTypeName } from '../../JourneyTypeName';
import JourneyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import BlockTitleWithIcon from '../../../../core/ui/content/BlockTitleWithIcon';
import { CommunityRole } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { intersection } from 'lodash';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';

interface JourneyCardHorizontalProps {
  journey: {
    profile: {
      url: string;
      displayName: string;
      tagline: string;
      avatar?: Visual;
    };
    community?: {
      myRoles?: CommunityRole[];
    };
  };
  deepness?: number;
  journeyTypeName: JourneyTypeName;
}

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const VISIBLE_COMMUNITY_ROLES = [CommunityRole.Admin, CommunityRole.Lead] as const;

const JourneyCardHorizontal = ({
  journey,
  journeyTypeName,
  deepness = journeyTypeName === 'challenge' ? 0 : 1,
}: JourneyCardHorizontalProps) => {
  const Icon = JourneyIcon[journeyTypeName];

  const { t } = useTranslation();

  const [communityRole] = intersection(VISIBLE_COMMUNITY_ROLES, journey.community?.myRoles);

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
        <BlockTitleWithIcon title={journey.profile.displayName} icon={<Icon />} sx={{ height: gutters(1.5) }}>
          <FlexSpacer />
          {communityRole && (
            <Chip
              variant="filled"
              color="primary"
              label={
                <Typography variant="button">{t(`common.enums.communityRole.${communityRole}` as const)}</Typography>
              }
            />
          )}
        </BlockTitleWithIcon>
        <Caption noWrap component="div" lineHeight={gutters(1.5)}>
          {journey.profile.tagline}
        </Caption>
      </BadgeCardView>
    </ElevatedPaper>
  );
};

export default JourneyCardHorizontal;
