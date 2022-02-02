import React, { FC } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Aspect, VisualUriFragment } from '../../../../../models/graphql-schema';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { getVisualBannerNarrow } from '../../../../../utils/visuals.utils';
import { styled } from '@mui/material';
import remToPx from '../../../../../utils/remToPx/remToPx';

const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_FONT_SIZE = '1rem';
const LINE_CLAMP = 4;

const PREFIX = 'AspectCard';

const classes = {
  clampContainer: `${PREFIX}-clampContainer`,
  textClamp: `${PREFIX}-textClamp`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.clampContainer}`]: {
    height:
      remToPx(theme.typography.htmlFontSize, theme?.typography?.body1.fontSize ?? DEFAULT_FONT_SIZE) *
      ((theme?.typography?.body1?.lineHeight ?? DEFAULT_LINE_HEIGHT) as number) *
      LINE_CLAMP,
  },
  [`& .${classes.textClamp}`]: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: LINE_CLAMP,
  },
}));

// type NeededFields = 'title' | 'description' | 'nameID' | 'bannerNarrow' | 'id' | 'tagset';
type NeededFields = 'id' | 'displayName' | 'description' | 'type';
export interface AspectCardProps {
  aspect?: Pick<Aspect, NeededFields> & { bannerNarrow?: VisualUriFragment };
  ecoverseNameId?: string;
  challengeNameId?: string;
  loading?: boolean;
}

const AspectCard: FC<AspectCardProps> = ({ aspect, loading = false }) => {
  if (!aspect) {
    return <></>;
  }

  const { displayName = '', description = '', type = '' } = aspect as Aspect;
  const bannerNarrow = getVisualBannerNarrow(aspect?.bannerNarrow);

  return (
    <EntityContributionCard
      details={{
        headerText: displayName,
        mediaUrl: bannerNarrow,
        labelText: type,
        tags: [], // aspect.tagset?.tags ?? [],
      }}
      loading={loading}
    >
      {loading ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <Root>
          <Box className={classes.clampContainer}>
            <Typography className={classes.textClamp}>{description}</Typography>
          </Box>
        </Root>
      )}
    </EntityContributionCard>
  );
};
export default AspectCard;
