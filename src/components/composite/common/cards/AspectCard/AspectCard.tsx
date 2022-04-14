import React, { FC } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Aspect, VisualUriFragment } from '../../../../../models/graphql-schema';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { styled } from '@mui/material';
import remToPx from '../../../../../utils/remToPx/remToPx';
import { buildAspectUrl } from '../../../../../utils/urlBuilders';
import Markdown from '../../../../core/Markdown';

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
    marginBottom: theme.spacing(1),
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
export type AspectCardAspect = Pick<Aspect, NeededFields> & { bannerNarrow?: VisualUriFragment };
export interface AspectCardProps {
  aspect?: AspectCardAspect;
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
  const { nameID = '', displayName = '', description = '', type = '', tagset } = (aspect || {}) as AspectCardAspect;
  const bannerNarrow = aspect?.bannerNarrow?.uri;

  return (
    <EntityContributionCard
      details={{
        headerText: displayName,
        mediaUrl: bannerNarrow,
        labelText: type,
        tags: tagset?.tags ?? [],
        url: hubNameId && nameID && buildAspectUrl(nameID, hubNameId, challengeNameId, opportunityNameId),
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
            <Typography component={Markdown} className={classes.textClamp}>
              {description}
            </Typography>
          </Box>
        </Root>
      )}
    </EntityContributionCard>
  );
};
export default AspectCard;
