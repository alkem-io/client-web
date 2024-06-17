import { ContributeCardProps } from '../../../../core/ui/card/ContributeCard';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { TemplateWithInnovationPack } from '../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialogGalleryStep';
import PostTemplateCard from '../../post/PostTemplateCard/PostTemplateCard';
import WhiteboardTemplateCard from '../../whiteboard/WhiteboardTemplateCard/WhiteboardTemplateCard';
import InnovationFlowTemplateCard, {
  InnovationFlowTemplate,
} from '../../InnovationFlow/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import CommunityGuidelinesTemplateCard from '../../communityGuidelines/CommunityGuidelinesTemplateCard/CommunityGuidelinesTemplateCard';
import { PostTemplate } from '../../post/PostTemplateCard/PostTemplate';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import CalloutTemplateCard, { CalloutTemplate } from '../../callout/CalloutTemplateCard/CalloutTemplateCard';
import { TemplateType } from '../InnovationPackProfilePage/InnovationPackProfilePage';

export type LibraryTemplateCardProps = Identifiable &
  TemplateWithInnovationPack<
    | (PostTemplate & { templateType: TemplateType.PostTemplate })
    | (TemplateBase & { templateType: TemplateType.WhiteboardTemplate })
    | (InnovationFlowTemplate & { templateType: TemplateType.InnovationFlowTemplate })
    | (CalloutTemplate & { templateType: TemplateType.CalloutTemplate })
    | (TemplateBase & { templateType: TemplateType.CommunityGuidelinesTemplate })
  > & { onClick?: ContributeCardProps['onClick'] };

const LibraryTemplateCard = (props: LibraryTemplateCardProps) => {
  switch (props.templateType) {
    case TemplateType.PostTemplate: {
      const { onClick, templateType, ...template } = props;
      return <PostTemplateCard onClick={onClick} template={template} innovationPack={template.innovationPack} />;
    }
    case TemplateType.WhiteboardTemplate: {
      const { onClick, templateType, ...template } = props;
      return <WhiteboardTemplateCard onClick={onClick} template={template} innovationPack={template.innovationPack} />;
    }
    case TemplateType.InnovationFlowTemplate: {
      const { onClick, templateType, ...template } = props;
      return (
        <InnovationFlowTemplateCard onClick={onClick} template={template} innovationPack={template.innovationPack} />
      );
    }
    case TemplateType.CalloutTemplate: {
      const { onClick, templateType, ...template } = props;
      return <CalloutTemplateCard onClick={onClick} template={template} innovationPack={template.innovationPack} />;
    }
    case TemplateType.CommunityGuidelinesTemplate: {
      const { onClick, templateType, ...template } = props;
      return (
        <CommunityGuidelinesTemplateCard
          onClick={onClick}
          template={template}
          innovationPack={template.innovationPack}
        />
      );
    }
  }
};

export default LibraryTemplateCard;
