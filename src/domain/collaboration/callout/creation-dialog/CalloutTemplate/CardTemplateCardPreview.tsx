import React, { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import EntityContributionCard from '../../../../../common/components/composite/common/cards/ContributionCard/EntityContributionCard';
import { Aspect, AspectTemplateFragment, VisualUriFragment } from '../../../../../core/apollo/generated/graphql-schema';
import WrapperMarkdown from '../../../../../common/components/core/WrapperMarkdown';

const DEFAULT_LINE_HEIGHT = 1.5;
const LINE_CLAMP = 4;

type NeededFields = 'id' | 'nameID' | 'displayName' | 'profile' | 'type';
export type CardTemplatePreview = Pick<Aspect, NeededFields> & { bannerNarrow?: VisualUriFragment } & {
  calloutNameId: string;
};

export interface CardTemplatePreviewProps {
  cardTemplate: AspectTemplateFragment;
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
      <Box
        sx={theme => ({
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
        })}
      >
        <Typography
          component={WrapperMarkdown}
          sx={theme => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1),
            '& p': {
              margin: 0,
            },
          })}
        >
          {defaultDescription}
        </Typography>
      </Box>
    </EntityContributionCard>
  );
};

export default CardTemplatePreviewCard;
