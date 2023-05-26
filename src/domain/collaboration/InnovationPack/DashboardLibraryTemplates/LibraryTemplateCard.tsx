import { ContributeCardProps } from '../../../../core/ui/card/ContributeCard';
import { Identifiable } from '../../../shared/types/Identifiable';
import PostTemplateCard, { PostTemplate } from '../../aspect/PostTemplateCard/PostTemplateCard';
import { WhiteboardTemplate } from '../../canvas/WhiteboardTemplateCard/WhiteboardTemplate';
import WhiteboardTemplateCard from '../../canvas/WhiteboardTemplateCard/WhiteboardTemplateCard';
import { InnovationFlowTemplate } from '../../templates/InnovationFlowTemplateCard/InnovationFlowTemplate';
import InnovationFlowTemplateCard from '../../templates/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';

export type LibraryTemplateCardProps = Identifiable &
  (
    | (PostTemplate & { templateType: TemplateType.PostTemplate })
    | (WhiteboardTemplate & { templateType: TemplateType.WhiteboardTemplate })
    | (InnovationFlowTemplate & { templateType: TemplateType.InnovationFlowTemplate })
  ) & { onClick?: ContributeCardProps['onClick'] };

const LibraryTemplateCard = ({ templateType, onClick, ...template }: LibraryTemplateCardProps) => {
  switch (templateType) {
    case TemplateType.PostTemplate: {
      return <PostTemplateCard onClick={onClick} template={template as PostTemplate} />;
    }
    case TemplateType.WhiteboardTemplate: {
      return <WhiteboardTemplateCard onClick={onClick} template={template as WhiteboardTemplate} />;
    }
    case TemplateType.InnovationFlowTemplate: {
      return <InnovationFlowTemplateCard onClick={onClick} template={template as InnovationFlowTemplate} />;
    }
  }
};

export default LibraryTemplateCard;
