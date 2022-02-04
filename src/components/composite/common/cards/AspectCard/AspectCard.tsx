import React, { FC } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Aspect, VisualUriFragment } from '../../../../../models/graphql-schema';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { getVisualBannerNarrow } from '../../../../../utils/visuals.utils';
import { styled } from '@mui/material';
import remToPx from '../../../../../utils/remToPx/remToPx';
import { buildAspectUrl } from '../../../../../utils/urlBuilders';

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

type NeededFields = 'id' | 'nameID' | 'displayName' | 'description' | 'type' | 'tagset';
type AspectType = Pick<Aspect, NeededFields> & { bannerNarrow?: VisualUriFragment };
export interface AspectCardProps {
  aspect?: AspectType;
  hubNameId?: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  loading?: boolean;
}

const AspectCard: FC<AspectCardProps> = ({
  aspect,
  loading = false,
  hubNameId,
  challengeNameId,
  opportunityNameId,
}) => {
  if (!aspect) {
    return <></>;
  }

  const { nameID, displayName = '', description = '', type = '', tagset } = aspect as AspectType;
  const bannerNarrow = getVisualBannerNarrow(aspect?.bannerNarrow);

  return (
    <EntityContributionCard
      details={{
        headerText: displayName,
        mediaUrl: bannerNarrow,
        labelText: type,
        tags: tagset?.tags ?? [],
        url: hubNameId && buildAspectUrl(nameID, hubNameId, challengeNameId, opportunityNameId),
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
