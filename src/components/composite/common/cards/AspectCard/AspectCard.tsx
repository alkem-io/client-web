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
const HEADER_TEXT_MAX_LENGTH = 20;
const HEADER_TEXT_POSTFIX = '...';

const PREFIX = 'AspectCard';

const classes = {
  clampContainer: `${PREFIX}-clampContainer`,
  text: `${PREFIX}-text`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.clampContainer}`]: {
    height:
      remToPx(theme.typography.htmlFontSize, theme?.typography?.body1.fontSize ?? DEFAULT_FONT_SIZE) *
      ((theme?.typography?.body1?.lineHeight ?? DEFAULT_LINE_HEIGHT) as number) *
      LINE_CLAMP,
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

  const headerText =
    displayName.length > HEADER_TEXT_MAX_LENGTH
      ? displayName.substring(0, HEADER_TEXT_MAX_LENGTH - HEADER_TEXT_POSTFIX.length).concat(HEADER_TEXT_POSTFIX)
      : displayName;

  return (
    <EntityContributionCard
      details={{
        headerText,
        mediaUrl: bannerNarrow,
        labelText: type,
        labelAboveTitle: true,
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
