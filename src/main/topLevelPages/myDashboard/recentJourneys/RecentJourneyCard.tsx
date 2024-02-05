import { Visual } from '../../../../domain/common/visual/Visual';
import { Avatar, Paper, Skeleton } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import GridItem from '../../../../core/ui/grid/GridItem';
import withElevationOnHover from '../../../../domain/shared/components/withElevationOnHover';
import RoundedIcon from '../../../../core/ui/icon/RoundedIcon';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import React from 'react';
import { JourneyTypeName } from '../../../../domain/journey/JourneyTypeName';
import JourneyIcon from '../../../../domain/shared/components/JourneyIcon/JourneyIcon';
import { alpha } from '@mui/material/styles';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import { BlockTitle } from '../../../../core/ui/typography';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';

interface RecentJourneyCardProps {
  journey:
    | {
        profile: {
          displayName: string;
          url: string;
          cardBanner?: Visual;
        };
      }
    | undefined;
  journeyTypeName: JourneyTypeName;
}

export const RECENT_JOURNEY_CARD_ASPECT_RATIO = '175/100';

const JOURNEY_TITLE_CLASS_NAME = 'JourneyTitle';

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const RecentJourneyCard = ({ journey, journeyTypeName }: RecentJourneyCardProps) => {
  const Icon = JourneyIcon[journeyTypeName];

  const columns = useColumns();

  const isMobile = columns <= 4;

  return (
    <GridItem columns={2}>
      <ElevatedPaper
        component={RouterLink}
        to={journey?.profile.url ?? ''}
        sx={{
          position: 'relative',
          [`:hover .${JOURNEY_TITLE_CLASS_NAME}`]: {
            opacity: 1,
          },
        }}
      >
        {journey && (
          <Avatar
            src={journey.profile.cardBanner?.uri}
            sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
            variant="square"
          >
            <InsertPhotoOutlinedIcon fontSize="large" />
          </Avatar>
        )}
        {journey && (
          <BadgeCardView
            visual={<RoundedIcon size="small" component={Icon} />}
            gap={1}
            height={gutters(3)}
            paddingY={1}
            paddingX={1.5}
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            square
            className={JOURNEY_TITLE_CLASS_NAME}
            sx={{
              backgroundColor: theme => alpha(theme.palette.background.paper, 0.7),
              opacity: isMobile ? 1 : 0,
              transition: 'opacity 200ms',
              backdropFilter: 'blur(10px)',
            }}
          >
            <BlockTitle component="div" sx={webkitLineClamp(2)}>
              {journey.profile.displayName}
            </BlockTitle>
          </BadgeCardView>
        )}
        {!journey && (
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
          />
        )}
      </ElevatedPaper>
    </GridItem>
  );
};

export default RecentJourneyCard;
