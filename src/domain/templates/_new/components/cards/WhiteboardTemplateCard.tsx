import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import CardHeader from '../../../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../../../core/ui/card/CardHeaderCaption';
import CardImage from '../../../../../core/ui/card/CardImage';
import CardSegmentCaption from '../../../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../../../core/ui/card/ContributeCard';
import { Caption } from '../../../../../core/ui/typography/components';
import InnovationPackIcon from '../../../../InnovationPack/InnovationPackIcon';
import { WhiteboardIcon } from '../../../../collaboration/whiteboard/icon/WhiteboardIcon';
import CardTags from '../../../../../core/ui/card/CardTags';
import { gutters } from '../../../../../core/ui/grid/utils';
import {
  InnovationPackTemplate,
  TemplateCardBaseProps,
} from '../../../library/CollaborationTemplatesLibrary/TemplateBase';

interface WhiteboardTemplateCardProps extends TemplateCardBaseProps<InnovationPackTemplate> {}

const WhiteboardTemplateCard: FC<WhiteboardTemplateCardProps> = ({ template, innovationPack, loading, ...props }) => {
  const cardInnovationPack = innovationPack || template?.innovationPack;
  return (
    <ContributeCard {...props}>
      <CardHeader title={template?.profile.displayName} iconComponent={WhiteboardIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption logoUrl={cardInnovationPack?.provider?.profile.avatar?.uri}>
          {cardInnovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardImage
        src={template?.profile.visual?.uri}
        alt={template?.profile.displayName}
        defaultImage={<WhiteboardIcon />}
      />
      <CardTags
        position="relative"
        top={gutters(-1)}
        marginY={gutters(-0.5)}
        tags={template?.profile.tagset?.tags ?? []}
        hideIfEmpty
      />
      {cardInnovationPack?.profile.displayName && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{cardInnovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default WhiteboardTemplateCard;
