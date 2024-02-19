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
import { TemplateBase, TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import useInnovationFlowStatesReader from '../../../platform/admin/templates/InnovationTemplates/useInnovationFlowStatesReader';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardContent from '../../../../core/ui/card/CardContent';
import CardTags from '../../../../core/ui/card/CardTags';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';

interface InnovationFlowTemplate extends TemplateBase {
  definition: string;
}

interface InnovationFlowTemplateCardProps extends TemplateCardBaseProps<InnovationFlowTemplate> {}

const InnovationFlowTemplateCard = ({
  template,
  innovationPack,
  loading,
  onClick,
}: InnovationFlowTemplateCardProps) => {
  const { states } = useInnovationFlowStatesReader({ definition: template?.definition });

  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.profile.displayName} iconComponent={InnovationFlowIcon as SvgIconComponent}>
        {loading && <Skeleton />}
        <CardHeaderCaption noWrap logoUrl={innovationPack?.provider?.profile.avatar?.uri}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardDetails>
        <CardDescription heightGutters={3}>{template?.profile.description}</CardDescription>
      </CardDetails>
      <CardDetails>
        <CardContent>
          <Caption sx={webkitLineClamp(2, { keepMinHeight: true })}>{states.join(' · ')}</Caption>
        </CardContent>
      </CardDetails>
      <CardDetails>
        <CardTags tags={template?.profile.tagset?.tags ?? []} marginY={1} hideIfEmpty />
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
