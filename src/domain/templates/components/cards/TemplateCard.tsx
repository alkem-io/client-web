import React, { FC } from 'react';
import { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import CalloutTemplateCard from './CalloutTemplateCard';
import CommunityGuidelinesTemplateCard from './CommunityGuidelinesTemplateCard';
import PostTemplateCard from './PostTemplateCard';
import InnovationFlowTemplateCard from './InnovationFlowTemplateCard';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplateWithInnovationPack } from '../../models/TemplateBase';
import CollaborationTemplateCard from './CollabTemplateCard';

export interface TemplateCardProps extends AnyTemplateWithInnovationPack, ContributeCardProps {
  link?: {
    to?: string;
    state?: Record<string, unknown>;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  };
  loading?: boolean;
}

const TemplateCard: FC<TemplateCardProps> = ({ template, link, ...rest }) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <CalloutTemplateCard template={template} {...link} {...rest} />;
    case TemplateType.Collaboration:
      return <CollaborationTemplateCard template={template} {...link} {...rest} />;
    case TemplateType.CommunityGuidelines:
      return <CommunityGuidelinesTemplateCard template={template} {...link} {...rest} />;
    case TemplateType.InnovationFlow:
      return <InnovationFlowTemplateCard template={template} {...link} {...rest} />;
    case TemplateType.Post:
      return <PostTemplateCard template={template} {...link} {...rest} />;
    case TemplateType.Whiteboard:
      return <WhiteboardTemplateCard template={template} {...link} {...rest} />;
  }
  return null;
};

export default TemplateCard;
