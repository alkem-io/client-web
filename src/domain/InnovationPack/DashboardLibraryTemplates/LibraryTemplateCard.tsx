import { ContributeCardProps } from '../../../core/ui/card/ContributeCard';
import { Identifiable } from '../../../core/utils/Identifiable';
import { TemplateWithInnovationPack } from '../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import PostTemplateCard from '../../templates/_new/components/cards/PostTemplateCard';
import WhiteboardTemplateCard from '../../templates/_new/components/cards/WhiteboardTemplateCard';
import InnovationFlowTemplateCard, {
  InnovationFlowTemplate,
} from '../../templates/_new/components/cards/InnovationFlowTemplateCard';
import { PostTemplate } from '../../templates/_new/models/PostTemplate';
import { TemplateBase } from '../../templates/library/CollaborationTemplatesLibrary/TemplateBase';
import CalloutTemplateCard, { CalloutTemplate } from '../../templates/_new/components/cards/CalloutTemplateCard';
import CommunityGuidelinesTemplateCard from '../../templates/_new/components/cards/CommunityGuidelinesTemplateCard';
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
