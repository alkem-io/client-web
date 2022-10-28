import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material';
import EntityContributionCard from '../../../../../common/components/composite/common/cards/ContributionCard/EntityContributionCard';
import { Aspect, AspectTemplate, VisualUriFragment } from '../../../../../models/graphql-schema';
import WrapperMarkdown from '../../../../../common/components/core/WrapperMarkdown';

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
export type CardTemplatePreview = Pick<Aspect, NeededFields> & { bannerNarrow?: VisualUriFragment } & {
  calloutNameId: string;
};

export interface CardTemplatePreviewProps {
  cardTemplate: AspectTemplate;
  keepScroll?: boolean;
}

const CardTemplatePreviewCard: FC<CardTemplatePreviewProps> = ({ cardTemplate, keepScroll }) => {
  const { defaultDescription, info, type = '' } = cardTemplate;
  const bannerNarrow = info.visual?.uri;

  return (
    <EntityContributionCard
      details={{
        headerText: 'Card name',
        mediaUrl: bannerNarrow,
        labelText: type,
        labelAboveTitle: true,
        tags: info.tagset?.tags,
        keepScroll: keepScroll,
      }}
      loading={false}
    >
      <Root>
        <Box className={classes.clampContainer}>
          <Typography component={WrapperMarkdown} className={classes.text}>
            {defaultDescription}
          </Typography>
        </Box>
      </Root>
    </EntityContributionCard>
  );
};
export default CardTemplatePreviewCard;
