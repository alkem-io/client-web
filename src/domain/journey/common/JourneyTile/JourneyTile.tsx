import React, { memo } from 'react';
import { Visual } from '../../../common/visual/Visual';
import { Avatar, Box, Paper, Skeleton } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import GridItem from '../../../../core/ui/grid/GridItem';
import withElevationOnHover from '../../../shared/components/withElevationOnHover';
import { gutters } from '../../../../core/ui/grid/utils';
import { JourneyTypeName } from '../../JourneyTypeName';
import { alpha } from '@mui/material/styles';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import { BlockTitle } from '../../../../core/ui/typography';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import defaultJourneyCardBanner from '../../../../domain/journey/defaultVisuals/Card.jpg';

interface JourneyTileProps {
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

const JourneyTile = ({ journey }: JourneyTileProps) => {
  return (
    <GridItem columns={3}>
      <ElevatedPaper
        component={RouterLink}
        to={journey?.profile.url ?? ''}
        sx={{
          position: 'relative',
        }}
      >
        {!journey ? (
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
          />
        ) : (
          <>
            <Avatar
              src={journey.profile.cardBanner?.uri || defaultJourneyCardBanner}
              sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
              variant="square"
            >
              <InsertPhotoOutlinedIcon fontSize="large" />
            </Avatar>
            <Box
              gap={1}
              height={gutters(2.5)}
              paddingY={1}
              paddingX={1.5}
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              className={JOURNEY_TITLE_CLASS_NAME}
              sx={{
                display: 'flex',
                alignItems: 'center',
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
            </Box>
          </>
        )}
      </ElevatedPaper>
    </GridItem>
  );
};

export default memo(JourneyTile);
