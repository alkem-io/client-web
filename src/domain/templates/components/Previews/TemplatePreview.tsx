import { useTemplateContentQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';
import CalloutTemplatePreview from './CalloutTemplatePreview';
import CollaborationTemplatePreview from './CollaborationTemplatePreview';
import CommunityGuidelinesTemplatePreview from './CommunityGuidelinesTemplatePreview';
import InnovationFlowTemplatePreview from './InnovationFlowTemplatePreview';
import PostTemplatePreview from './PostTemplatePreview';
import WhiteboardTemplatePreview from './WhiteboardTemplatePreview';

interface TemplatePreviewProps {
  // All the data coming in `template` is ignored,
  // even if the template was already loaded, the preview will reload all the data that it needs
  // If you want to use custom data, use directly the specific preview component
  template?: Identifiable & { type: TemplateType };
}

const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  const { data } = useTemplateContentQuery({
    variables: {
      templateId: template?.id!,
      includeCallout: template?.type === TemplateType.Callout,
      includeCommunityGuidelines: template?.type === TemplateType.CommunityGuidelines,
      includeInnovationFlow: template?.type === TemplateType.InnovationFlow,
      includeCollaboration: template?.type === TemplateType.Collaboration,
      includePost: template?.type === TemplateType.Post,
      includeWhiteboard: template?.type === TemplateType.Whiteboard,
    },
    skip: !template?.id,
  });

  const templateData = data?.lookup.template;

  switch (template?.type) {
    case TemplateType.Callout:
      return <CalloutTemplatePreview template={templateData} />;
    case TemplateType.CommunityGuidelines:
      return <CommunityGuidelinesTemplatePreview template={templateData} />;
    case TemplateType.Post:
      return <PostTemplatePreview template={templateData} />;
    case TemplateType.InnovationFlow:
      return <InnovationFlowTemplatePreview template={templateData} />;
    case TemplateType.Collaboration:
      return <CollaborationTemplatePreview template={templateData} />;
    case TemplateType.Whiteboard:
      return <WhiteboardTemplatePreview template={templateData} />;
  }
  throw new Error('Template type not supported');
};

export default TemplatePreview;
