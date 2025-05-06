import React, { FC } from 'react';
import { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import CalloutTemplateCard from './CalloutTemplateCard';
import CommunityGuidelinesTemplateCard from './CommunityGuidelinesTemplateCard';
import PostTemplateCard from './PostTemplateCard';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplateWithInnovationPack } from '@/domain/templates/models/TemplateBase';
import CollaborationTemplateCard from './CollabTemplateCard';

export interface TemplateCardProps extends AnyTemplateWithInnovationPack, ContributeCardProps {
  loading?: boolean;
}

const TemplateCard: FC<TemplateCardProps> = ({ template, ...rest }) => {
  switch (template.type) {
    case TemplateType.Collaboration:
      return <CollaborationTemplateCard template={template} {...rest} />;
    case TemplateType.Callout:
      return <CalloutTemplateCard template={template} {...rest} />;
    case TemplateType.CommunityGuidelines:
      return <CommunityGuidelinesTemplateCard template={template} {...rest} />;
    case TemplateType.Post:
      return <PostTemplateCard template={template} {...rest} />;
    case TemplateType.Whiteboard:
      return <WhiteboardTemplateCard template={template} {...rest} />;
  }
  return null;
};

export default TemplateCard;
