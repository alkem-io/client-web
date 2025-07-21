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
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { SpaceLevel, VisualType } from '@/core/apollo/generated/graphql-schema';
import { PrivacyIcon } from '../../icons/PrivacyIcon';
import { SpaceAboutTileModel } from '../../about/model/SpaceAboutTile.model';

type SpaceTileProps = {
  space:
    | {
        id?: string;
        about: SpaceAboutTileModel;
        level?: SpaceLevel;
      }
    | undefined;
  columns?: number;
  disableLink?: boolean;
};

export const RECENT_SPACE_CARD_ASPECT_RATIO = '175/100';

const SPACE_TITLE_CLASS_NAME = 'SpaceTitle';
const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const SpaceTile = ({ space, columns = 3, disableLink }: SpaceTileProps) => {
  const isPrivate = space?.about.isContentPublic === false;

  const getVisualUrl = () => {
    if (space?.about.profile.cardBanner?.uri) {
      return space.about.profile.cardBanner.uri;
    }

    return getDefaultSpaceVisualUrl(VisualType.Card, space?.id);
  };

  return (
    <GridItem columns={columns}>
      <ElevatedPaper
        {...(disableLink ? undefined : { component: RouterLink, to: space?.about.profile.url ?? '' })}
        sx={{
          position: 'relative',
        }}
      >
        {!space ? (
          <Skeleton
            variant="rectangular"
            sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_SPACE_CARD_ASPECT_RATIO }}
          />
        ) : (
          <>
            {isPrivate && <PrivacyIcon />}

            <Avatar
              src={getVisualUrl()}
              sx={{ width: '100%', height: 'auto', aspectRatio: RECENT_SPACE_CARD_ASPECT_RATIO }}
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
              className={SPACE_TITLE_CLASS_NAME}
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
                {space.about.profile.displayName}
              </BlockTitle>
            </Box>
          </>
        )}
      </ElevatedPaper>
    </GridItem>
  );
};

export default memo(SpaceTile);
