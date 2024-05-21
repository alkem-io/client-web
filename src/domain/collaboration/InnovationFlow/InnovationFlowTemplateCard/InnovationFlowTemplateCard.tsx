import React from 'react';
import { Skeleton } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import { Caption } from '../../../../core/ui/typography/components';
import InnovationPackIcon from '../../InnovationPack/InnovationPackIcon';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';
import {
  InnovationPackTemplate,
  TemplateCardBaseProps,
} from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import CardDescription, { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '../../../../core/ui/card/CardDescription';
import CardContent from '../../../../core/ui/card/CardContent';
import CardTags from '../../../../core/ui/card/CardTags';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import { InnovationFlowState } from '../InnovationFlow';

export interface InnovationFlowTemplate extends InnovationPackTemplate {
  states: InnovationFlowState[];
}

interface InnovationFlowTemplateCardProps extends TemplateCardBaseProps<InnovationFlowTemplate> {}

const InnovationFlowTemplateCard = ({
  template,
  innovationPack,
  loading,
  onClick,
}: InnovationFlowTemplateCardProps) => {
  const states = template?.states;

  const hasTags = (template?.profile.tagset?.tags ?? []).length > 0;
  const descriptionHeightGutters = hasTags
    ? DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS - 2
    : DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS;

  const cardInnovationPack = innovationPack || template?.innovationPack;

  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.profile.displayName} iconComponent={InnovationFlowIcon as SvgIconComponent}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={cardInnovationPack?.provider?.profile.avatar?.uri}>
          {cardInnovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription heightGutters={descriptionHeightGutters}>{template?.profile.description}</CardDescription>
      </CardDetails>
      <CardDetails>
        <CardContent>
          <Caption sx={webkitLineClamp(2, { keepMinHeight: true })}>
            {states?.map(state => state.displayName)?.join(' · ')}
          </Caption>
        </CardContent>
      </CardDetails>
      <CardDetails>
        <CardTags tags={template?.profile.tagset?.tags ?? []} marginY={1} hideIfEmpty />
      </CardDetails>
      {cardInnovationPack && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{cardInnovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default InnovationFlowTemplateCard;
