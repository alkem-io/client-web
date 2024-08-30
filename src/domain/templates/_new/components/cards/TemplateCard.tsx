import React, { FC } from 'react';
import { ContributeCardProps } from '../../../../../core/ui/card/ContributeCard';
import { CalloutTemplate } from '../../models/CalloutTemplate';
import CalloutTemplateCard from './CalloutTemplateCard';
import { CommunityGuidelinesTemplate } from '../../models/CommunityGuidelinesTemplate';
import CommunityGuidelinesTemplateCard from './CommunityGuidelinesTemplateCard';
import { PostTemplate } from '../../models/PostTemplate';
import PostTemplateCard from './PostTemplateCard';
import { InnovationFlowTemplate } from '../../models/InnovationFlowTemplate';
import InnovationFlowTemplateCard from './InnovationFlowTemplateCard';
import { WhiteboardTemplate } from '../../models/WhiteboardTemplate';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';

export interface TemplateCardProps extends ContributeCardProps {
  template: CalloutTemplate | CommunityGuidelinesTemplate | InnovationFlowTemplate | PostTemplate | WhiteboardTemplate;
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

const TemplateCard: FC<TemplateCardProps> = ({ template, ...rest }) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <CalloutTemplateCard template={template} {...rest} good />;
    case TemplateType.CommunityGuidelines:
      return <CommunityGuidelinesTemplateCard template={template} {...rest} good />;
    case TemplateType.InnovationFlow:
      return <InnovationFlowTemplateCard template={template} {...rest} good />;
    case TemplateType.Post:
      return <PostTemplateCard template={template} {...rest} good />;
    case TemplateType.Whiteboard:
      return <WhiteboardTemplateCard template={template} {...rest} good />;
  }
  return null;
};

export default TemplateCard;
