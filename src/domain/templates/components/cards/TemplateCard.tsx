import type { FC } from 'react';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type { ContributeCardProps } from '@/core/ui/card/ContributeCard';
import type { AnyTemplateWithInnovationPack } from '@/domain/templates/models/TemplateBase';
import CalloutTemplateCard from './CalloutTemplateCard';
import CommunityGuidelinesTemplateCard from './CommunityGuidelinesTemplateCard';
import PostTemplateCard from './PostTemplateCard';
import SpaceTemplateCard from './SpaceTemplateCard';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';

export interface TemplateCardProps extends AnyTemplateWithInnovationPack, ContributeCardProps {
  loading?: boolean;
}

const TemplateCard: FC<TemplateCardProps> = ({ template, ...rest }) => {
  switch (template.type) {
    case TemplateType.Space:
      return <SpaceTemplateCard template={template} {...rest} />;
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
