import React from 'react';
import { Visual } from '../../../../domain/common/visual/Visual';
import { Avatar, Paper, Skeleton } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import GridItem from '../../../../core/ui/grid/GridItem';
import withElevationOnHover from '../../../../domain/shared/components/withElevationOnHover';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { JourneyTypeName } from '../../../../domain/journey/JourneyTypeName';
import { alpha } from '@mui/material/styles';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import { BlockTitle } from '../../../../core/ui/typography';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import defaultJourneyCardBanner from '../../../../domain/journey/defaultVisuals/Card.jpg';

interface JourneyHoverCardProps {
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

const JourneyHoverCard = ({ journey }: JourneyHoverCardProps) => {
  return (
    <GridItem columns={3}>
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
            src={journey.profile.cardBanner?.uri || defaultJourneyCardBanner}
            sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
            variant="square"
          >
            <InsertPhotoOutlinedIcon fontSize="large" />
          </Avatar>
        )}
        {journey && (
          <BadgeCardView
            gap={1}
            height={gutters(2.5)}
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
              opacity: 1,
              transition: 'opacity 200ms',
              backdropFilter: 'blur(10px)',
              borderRadius: theme => ` 0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
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

export default JourneyHoverCard;
