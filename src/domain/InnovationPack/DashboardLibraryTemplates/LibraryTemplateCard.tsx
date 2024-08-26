import { ContributeCardProps } from '../../../core/ui/card/ContributeCard';
import { Identifiable } from '../../../core/utils/Identifiable';
import { TemplateWithInnovationPack } from '../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import PostTemplateCard from '../../templates/cards/PostTemplateCard/PostTemplateCard';
import WhiteboardTemplateCard from '../../templates/cards/WhiteboardTemplateCard/WhiteboardTemplateCard';
import InnovationFlowTemplateCard, {
  InnovationFlowTemplate,
} from '../../templates/cards/InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import { PostTemplate } from '../../templates/cards/PostTemplateCard/PostTemplate';
import { TemplateBase } from '../../templates/library/CollaborationTemplatesLibrary/TemplateBase';
import CalloutTemplateCard, { CalloutTemplate } from '../../templates/cards/CalloutTemplateCard/CalloutTemplateCard';
import CommunityGuidelinesTemplateCard from '../../templates/cards/CommunityGuidelinesTemplateCard/CommunityGuidelinesTemplateCard';
import { TemplateType } from '../../../core/apollo/generated/graphql-schema';

export type LibraryTemplateCardProps = Identifiable &
  TemplateWithInnovationPack<
    | (PostTemplate & { templateType: TemplateType.Post })
    | (TemplateBase & { templateType: TemplateType.Whiteboard })
    | (InnovationFlowTemplate & { templateType: TemplateType.InnovationFlow })
    | (CalloutTemplate & { templateType: TemplateType.Callout })
    | (TemplateBase & { templateType: TemplateType.CommunityGuidelines })
  > & { onClick?: ContributeCardProps['onClick'] };

const LibraryTemplateCard = (props: LibraryTemplateCardProps) => {
  switch (props.templateType) {
    case TemplateType.Post: {
      const { onClick, templateType, ...template } = props;
      return <PostTemplateCard onClick={onClick} template={template} innovationPack={template.innovationPack} />;
    }
    case TemplateType.Whiteboard: {
      const { onClick, templateType, ...template } = props;
      return <WhiteboardTemplateCard onClick={onClick} template={template} innovationPack={template.innovationPack} />;
    }
    case TemplateType.InnovationFlow: {
      const { onClick, templateType, ...template } = props;
      return (
        <InnovationFlowTemplateCard onClick={onClick} template={template} innovationPack={template.innovationPack} />
      );
    }
    case TemplateType.Callout: {
      const { onClick, templateType, ...template } = props;
      return <CalloutTemplateCard onClick={onClick} template={template} innovationPack={template.innovationPack} />;
    }
    case TemplateType.CommunityGuidelines: {
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
