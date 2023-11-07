import { ContributeCardProps } from '../../../../core/ui/card/ContributeCard';
import { Identifiable } from '../../../../core/utils/Identifiable';
import PostTemplateCard from '../../post/PostTemplateCard/PostTemplateCard';
import WhiteboardTemplateCard from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';
import InnovationFlowTemplateCard from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';
import { PostTemplate } from '../../post/PostTemplateCard/PostTemplate';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { TemplateWithInnovationPack } from '../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialogGalleryStep';

export type LibraryTemplateCardProps = Identifiable &
  TemplateWithInnovationPack<
    | (PostTemplate & { templateType: TemplateType.PostTemplate })
    | (TemplateBase & { templateType: TemplateType.WhiteboardTemplate })
    | (TemplateBase & { templateType: TemplateType.InnovationFlowTemplate })
    | (TemplateBase & { templateType: TemplateType.CalloutTemplate })
  > & { onClick?: ContributeCardProps['onClick'] };

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
    case TemplateType.CalloutTemplate: {
      const { onClick, templateType, ...template } = props;
      // TODO CalloutTemplateCard
      return <PostTemplateCard onClick={onClick} template={template} />;
    }
  }
};

export default LibraryTemplateCard;
