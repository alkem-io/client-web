import { useTemplateContentQuery } from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { Identifiable } from '@/core/utils/Identifiable';
import TemplateContentCalloutPreview from './TemplateContentCalloutPreview';
import TemplateContentSpacePreview from './TemplateContentSpacePreview';
import TemplateContentCommunityGuidelinesPreview from './TemplateContentCommunityGuidelinesPreview';
import TemplateContentPostPreview from './TemplateContentPostPreview';
import TemplateContentWhiteboardPreview from './TemplateContentWhiteboardPreview';

interface TemplateContentPreviewProps {
  // All the data coming in `template` is ignored,
  // even if the template was already loaded, the preview will reload all the data that it needs
  // If you want to use custom data, use directly the specific preview component
  template?: Identifiable & { type: TemplateType };
}

const TemplateContentPreview = ({ template }: TemplateContentPreviewProps) => {
  const { data } = useTemplateContentQuery({
    variables: {
      templateId: template?.id!,
      includeCallout: template?.type === TemplateType.Callout,
      includeSpace: template?.type === TemplateType.Space,
      includeCommunityGuidelines: template?.type === TemplateType.CommunityGuidelines,
      includePost: template?.type === TemplateType.Post,
      includeWhiteboard: template?.type === TemplateType.Whiteboard,
    },
    skip: !template?.id,
  });

  const templateData = data?.lookup.template;

  switch (template?.type) {
    case TemplateType.Callout:
      return <TemplateContentCalloutPreview template={templateData} />;
    case TemplateType.Space:
      return <TemplateContentSpacePreview template={templateData} />;
    case TemplateType.CommunityGuidelines:
      return <TemplateContentCommunityGuidelinesPreview template={templateData} />;
    case TemplateType.Post:
      return <TemplateContentPostPreview template={templateData} />;
    case TemplateType.Whiteboard:
      return <TemplateContentWhiteboardPreview template={templateData} />;
  }
  throw new Error('Template type not supported');
};

export default TemplateContentPreview;
