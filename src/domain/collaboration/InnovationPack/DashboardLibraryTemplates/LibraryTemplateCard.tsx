import PostTemplateCard from '../../aspect/PostTemplateCard/PostTemplateCard';
import WhiteboardTemplateCard from '../../canvas/WhiteboardTemplateCard/WhiteboardTemplateCard';
import InnovationFlowTemplateCard from '../../templates/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';

export interface LibraryTemplateCardProps {
  templateType: TemplateType;
  id: string;
  innovationPack: {
    id: string | undefined;
    displayName: string | undefined;
  };
  displayName: string;
  visualUri: string | undefined;
  description: string | undefined;
  tags: string[] | undefined;
  provider: {
    displayName: string | undefined;
    avatarUri: string | undefined;
  };
  defaultDescription?: string;
  definition?: string;
}

const LibraryTemplateCard = ({ templateType, ...template }: LibraryTemplateCardProps) => {
  switch (templateType) {
    case TemplateType.PostTemplate: {
      return <PostTemplateCard template={template} />;
    }
    case TemplateType.WhiteboardTemplate: {
      return <WhiteboardTemplateCard template={template} />;
    }
    case TemplateType.InnovationFlowTemplate: {
      return <InnovationFlowTemplateCard template={template} />;
    }
  }
};

export default LibraryTemplateCard;
