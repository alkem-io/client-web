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
import { InnovationFlowIcon } from '../../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlowIcon';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import CardDescriptionWithTags from '../../../../core/ui/card/CardDescriptionWithTags';

interface InnovationFlowTemplateCardProps extends TemplateCardBaseProps {}

const InnovationFlowTemplateCard = ({
  template,
  innovationPack,
  loading,
  onClick,
}: InnovationFlowTemplateCardProps) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.profile.displayName} iconComponent={InnovationFlowIcon as SvgIconComponent}>
        {loading && <Skeleton />}
        <CardHeaderCaption noWrap logoUrl={innovationPack?.provider?.profile.avatar?.uri}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescriptionWithTags tags={template?.profile.tagset?.tags}>
          {template?.profile.description}
        </CardDescriptionWithTags>
      </CardDetails>
      {innovationPack && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default InnovationFlowTemplateCard;
