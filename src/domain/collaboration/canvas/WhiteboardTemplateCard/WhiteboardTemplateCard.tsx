import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import CardImage from '../../../../core/ui/card/CardImage';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import { Caption } from '../../../../core/ui/typography/components';
import InnovationPackIcon from '../../InnovationPack/InnovationPackIcon';
import { CanvasIcon } from '../icon/CanvasIcon';
import { WhiteboardTemplate } from './WhiteboardTemplate';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

interface WhiteboardTemplateCardProps extends TemplateCardBaseProps<WhiteboardTemplate> {}

const WhiteboardTemplateCard: FC<WhiteboardTemplateCardProps> = ({ template, loading, onClick }) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.displayName} iconComponent={CanvasIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption noWrap logoUrl={template?.provider?.avatarUri}>
          {template?.provider?.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardImage src={template?.visualUri} alt={template?.displayName} defaultImage={<CanvasIcon />} />
      {template?.innovationPack.displayName && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{template?.innovationPack.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default WhiteboardTemplateCard;
