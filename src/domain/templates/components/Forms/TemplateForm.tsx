import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import { TemplateFormActions } from '../Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';
import TemplateCalloutForm, { TemplateCalloutFormSubmittedValues } from './TemplateCalloutForm';
import TemplateSpaceForm, { TemplateSpaceFormSubmittedValues } from './TemplateSpaceForm';
import TemplateCommunityGuidelinesForm, {
  TemplateCommunityGuidelinesFormSubmittedValues,
} from './TemplateCommunityGuidelinesForm';
import TemplatePostForm, { TemplatePostFormSubmittedValues } from './TemplatePostForm';
import TemplateWhiteboardForm, { TemplateWhiteboardFormSubmittedValues } from './TemplateWhiteboardForm';

interface TemplateFormProps {
  template: AnyTemplate;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => Promise<unknown>;
  actions: TemplateFormActions;
  temporaryLocation?: boolean;
}

export type AnyTemplateFormSubmittedValues =
  | TemplateCalloutFormSubmittedValues
  | TemplateSpaceFormSubmittedValues
  | TemplateCommunityGuidelinesFormSubmittedValues
  | TemplatePostFormSubmittedValues
  | TemplateWhiteboardFormSubmittedValues;

const TemplateForm = ({ template, temporaryLocation = false, ...rest }: TemplateFormProps) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <TemplateCalloutForm template={template} {...rest} />;
    case TemplateType.Space:
      return <TemplateSpaceForm template={template} {...rest} />;
    case TemplateType.CommunityGuidelines:
      return <TemplateCommunityGuidelinesForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    case TemplateType.Post:
      return <TemplatePostForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    case TemplateType.Whiteboard:
      return <TemplateWhiteboardForm template={template} {...rest} />;
  }
  throw new Error('Template type not supported');
};

export default TemplateForm;
