import { ContributeCardProps } from '../../../../core/ui/card/ContributeCard';
import { Identifiable } from '../../../../core/utils/Identifiable';
import PostTemplateCard, { PostTemplate } from '../../post/PostTemplateCard/PostTemplateCard';
import { WhiteboardTemplate } from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplate';
import WhiteboardTemplateCard from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';
import { InnovationFlowTemplate } from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplate';
import InnovationFlowTemplateCard from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';

export type LibraryTemplateCardProps = Identifiable &
  (
    | (PostTemplate & { templateType: TemplateType.PostTemplate })
    | (WhiteboardTemplate & { templateType: TemplateType.WhiteboardTemplate })
    | (InnovationFlowTemplate & { templateType: TemplateType.InnovationFlowTemplate })
  ) & { onClick?: ContributeCardProps['onClick'] };

const LibraryTemplateCard = (props: LibraryTemplateCardProps) => {
  switch (props.templateType) {
    case TemplateType.PostTemplate: {
      const { onClick, templateType, ...template } = props;
      return <PostTemplateCard onClick={onClick} template={template} />;
    }
    case TemplateType.WhiteboardTemplate: {
      const { onClick, templateType, ...template } = props;
      return <WhiteboardTemplateCard onClick={onClick} template={template} />;
    }
    case TemplateType.InnovationFlowTemplate: {
      const { onClick, templateType, ...template } = props;
      return <InnovationFlowTemplateCard onClick={onClick} template={template} />;
    }
  }
};

export default LibraryTemplateCard;
