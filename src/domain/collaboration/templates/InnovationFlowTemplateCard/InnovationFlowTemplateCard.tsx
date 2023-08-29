import { TemplateCardBaseProps } from '../CollaborationTemplatesLibrary/TemplateBase';
import { InnovationFlowTemplate } from './InnovationFlowTemplate';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import { Skeleton } from '@mui/material';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import InnovationPackIcon from '../../InnovationPack/InnovationPackIcon';
import { Caption } from '../../../../core/ui/typography';
import React from 'react';
import { InnovationFlowIcon } from '../../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlowIcon';
import { SvgIconComponent } from '@mui/icons-material';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescriptionWithTags from '../../../../core/ui/card/CardDescriptionWithTags';

interface InnovationFlowTemplateCardProps extends TemplateCardBaseProps<InnovationFlowTemplate> {}

const InnovationFlowTemplateCard = ({ template, loading, onClick }: InnovationFlowTemplateCardProps) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.displayName} iconComponent={InnovationFlowIcon as SvgIconComponent}>
        {loading && <Skeleton />}
        <CardHeaderCaption noWrap logoUrl={template?.provider?.avatarUri}>
          {template?.provider?.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={template?.tags}>{template?.description}</CardDescriptionWithTags>
      </CardDetails>
      {template?.innovationPack.displayName && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{template?.innovationPack.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default InnovationFlowTemplateCard;
