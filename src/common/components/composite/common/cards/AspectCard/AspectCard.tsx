import React, { FC } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Aspect, VisualUriFragment } from '../../../../../../models/graphql-schema';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { styled } from '@mui/material';
import { buildAspectUrl } from '../../../../../utils/urlBuilders';
import Markdown from '../../../../core/Markdown';

const DEFAULT_LINE_HEIGHT = 1.5;
const LINE_CLAMP = 4;

const PREFIX = 'AspectCard';

const classes = {
  clampContainer: `${PREFIX}-clampContainer`,
  text: `${PREFIX}-text`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.clampContainer}`]: {
    height: `${LINE_CLAMP * ((theme?.typography?.body1?.lineHeight ?? DEFAULT_LINE_HEIGHT) as number)}em`,
    marginBottom: theme.spacing(1),
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      pointerEvents: 'none',
      background: 'linear-gradient(to top, rgba(255,255,255, 1) 0, rgba(255,255,255, 0) 1em)',
    },
  },
  [`& .${classes.text}`]: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    '& p': {
      margin: 0,
    },
  },
}));

type NeededFields = 'id' | 'nameID' | 'displayName' | 'description' | 'type' | 'tagset';
export type AspectCardAspect = Pick<Aspect, NeededFields> & { bannerNarrow?: VisualUriFragment } & {
  calloutNameId: string;
};

export interface AspectCardProps {
  aspect?: AspectCardAspect;
  hubNameId?: string;
  challengeNameId?: string;
  opportunityNameId?: string;
  loading?: boolean;
  keepScroll?: boolean;
}

const AspectCard: FC<AspectCardProps> = ({
  aspect,
  loading = false,
  hubNameId,
  challengeNameId,
  opportunityNameId,
  keepScroll,
}) => {
  const {
    nameID = '',
    calloutNameId = '',
    displayName = '',
    description = '',
    type = '',
    tagset,
  } = (aspect || {}) as AspectCardAspect;
  const bannerNarrow = aspect?.bannerNarrow?.uri;

  return (
    <EntityContributionCard
      details={{
        headerText: displayName,
        mediaUrl: bannerNarrow,
        labelText: type,
        labelAboveTitle: true,
        tags: tagset?.tags ?? [],
        url:
          hubNameId &&
          nameID &&
          buildAspectUrl({
            hubNameId,
            challengeNameId,
            opportunityNameId,
            calloutNameId,
            aspectNameId: nameID,
          }),
        keepScroll: keepScroll,
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
            <Typography component={Markdown} className={classes.text}>
              {description}
            </Typography>
          </Box>
        </Root>
      )}
    </EntityContributionCard>
  );
};
export default AspectCard;
