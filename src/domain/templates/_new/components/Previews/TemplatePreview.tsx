import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplate } from '../../models/TemplateBase';

interface TemplatePreviewProps {
  template: AnyTemplate;
  onClose: () => void;
}

const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <CalloutTemplatePreview template={template} />
    case TemplateType.CommunityGuidelines:
      return <CommunityGuidelinesTemplatePreview template={template} />
    case TemplateType.Post:
      return <PostTemplatePreview template={template} />
    case TemplateType.InnovationFlow:
      return <InnovationFlowTemplatePreview template={template} />
    case TemplateType.Whiteboard:
      return <WhiteboardTemplatePreview template={template} />
  }
  throw new Error('Template type not supported');
};

export default TemplatePreview;
