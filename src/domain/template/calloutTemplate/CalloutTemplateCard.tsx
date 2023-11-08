import { Skeleton } from '@mui/material';
import React, { FC } from 'react';
import CardHeader from '../../../core/ui/card/CardHeader';
import CardHeaderCaption from '../../../core/ui/card/CardHeaderCaption';
import CardImage from '../../../core/ui/card/CardImage';
import CardSegmentCaption from '../../../core/ui/card/CardSegmentCaption';
import ContributeCard from '../../../core/ui/card/ContributeCard';
import { Caption } from '../../../core/ui/typography/components';
import InnovationPackIcon from '../../collaboration/InnovationPack/InnovationPackIcon';
import { WhiteboardIcon } from '../../collaboration/whiteboard/icon/WhiteboardIcon';
import {
  TemplateBase,
  TemplateCardBaseProps,
} from '../../collaboration/templates/CollaborationTemplatesLibrary/TemplateBase';

interface CalloutTemplateCardProps extends TemplateCardBaseProps<TemplateBase> {}

const CalloutTemplateCard: FC<CalloutTemplateCardProps> = ({ template, innovationPack, loading, onClick }) => {
  return (
    <ContributeCard onClick={onClick}>
      <CardHeader title={template?.profile.displayName} iconComponent={WhiteboardIcon}>
        {loading && <Skeleton />}
        <CardHeaderCaption noWrap logoUrl={innovationPack?.provider?.profile.avatar?.uri}>
          {innovationPack?.provider?.profile.displayName}
        </CardHeaderCaption>
      </CardHeader>
      <CardImage
        src={template?.profile.visual?.uri}
        alt={template?.profile.displayName}
        defaultImage={<WhiteboardIcon />}
      />
      {innovationPack && (
        <CardSegmentCaption icon={<InnovationPackIcon />}>
          <Caption noWrap>{innovationPack?.profile.displayName}</Caption>
        </CardSegmentCaption>
      )}
      {loading && <Skeleton />}
    </ContributeCard>
  );
};

export default CalloutTemplateCard;
