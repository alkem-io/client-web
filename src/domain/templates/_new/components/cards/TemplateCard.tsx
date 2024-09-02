import React, { FC } from 'react';
import { ContributeCardProps } from '../../../../../core/ui/card/ContributeCard';
import CalloutTemplateCard from './CalloutTemplateCard';
import CommunityGuidelinesTemplateCard from './CommunityGuidelinesTemplateCard';
import PostTemplateCard from './PostTemplateCard';
import InnovationFlowTemplateCard from './InnovationFlowTemplateCard';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplate } from '../../models/TemplateBase';

export interface TemplateCardProps extends ContributeCardProps {
  template: AnyTemplate;
  // Common things for all the cards
  innovationPack?: {
    profile: {
      displayName: string;
    };
    provider?: {
      profile: {
        displayName: string;
        avatar?: {
          uri: string;
        };
      };
    };
  };
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
      return <CalloutTemplateCard template={template} {...link} {...rest} good />;
    case TemplateType.CommunityGuidelines:
      return <CommunityGuidelinesTemplateCard template={template} {...link} {...rest} good />;
    case TemplateType.InnovationFlow:
      return <InnovationFlowTemplateCard template={template} {...link} {...rest} good />;
    case TemplateType.Post:
      return <PostTemplateCard template={template} {...link} {...rest} good />;
    case TemplateType.Whiteboard:
      return <WhiteboardTemplateCard template={template} {...link}{...rest} good />;
  }
  return null;
};

export default TemplateCard;
