import { FC } from 'react';
import CardImage from '@/core/ui/card/CardImage';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';
import { WhiteboardTemplate } from '@/domain/templates/models/WhiteboardTemplate';
import { TemplateCardProps } from './TemplateCard';
import TemplateCardLayout from './TemplateCardLayout';

interface WhiteboardTemplateCardProps extends TemplateCardProps {
  template: WhiteboardTemplate;
}

const WhiteboardTemplateCard: FC<WhiteboardTemplateCardProps> = ({ template, innovationPack, loading, ...props }) => {
  return (
    <TemplateCardLayout
      templateName={template?.profile.displayName}
      innovationPack={innovationPack}
      tags={template?.profile.defaultTagset?.tags ?? []}
      loading={loading}
      {...props}
    >
      <CardImage
        src={template?.profile.visual?.uri}
        alt={template?.profile.displayName}
        defaultImage={<WhiteboardIcon />}
      />
    </TemplateCardLayout>
  );
};

export default WhiteboardTemplateCard;
