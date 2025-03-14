import { memo } from 'react';
import { Avatar, Box, Paper, Skeleton } from '@mui/material';
import RouterLink from '@/core/ui/link/RouterLink';
import GridItem from '@/core/ui/grid/GridItem';
import withElevationOnHover from '@/domain/shared/components/withElevationOnHover';
import { gutters } from '@/core/ui/grid/utils';
import { alpha } from '@mui/material/styles';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import { BlockTitle } from '@/core/ui/typography';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import { defaultVisualUrls } from '@/domain/journey/defaultVisuals/defaultVisualUrls';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { PrivacyIcon } from './PrivacyIcon';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

type JourneyTileProps = {
  journey:
    | {
        about: SpaceAboutLightModel;
        level?: SpaceLevel;
      }
    | undefined;
  columns?: number;
  isPrivate?: boolean;
};

export const RECENT_JOURNEY_CARD_ASPECT_RATIO = '175/100';

const JOURNEY_TITLE_CLASS_NAME = 'JourneyTitle';
const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const JourneyTile = ({ journey, isPrivate, columns = 3 }: JourneyTileProps) => {
  return (
    <GridItem columns={columns}>
      <ElevatedPaper
        component={RouterLink}
        to={journey?.about.profile.url ?? ''}
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
            {isPrivate && <PrivacyIcon />}

            <Avatar
              src={journey.about.profile.cardBanner?.uri || defaultVisualUrls[VisualType.Card]}
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
                {journey.about.profile.displayName}
              </BlockTitle>
            </Box>
          </>
        )}
      </ElevatedPaper>
    </GridItem>
  );
};

export default memo(JourneyTile);
