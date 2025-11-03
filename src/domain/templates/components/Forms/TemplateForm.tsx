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

interface AnyTemplateFormProps extends TemplateFormProps {}

export interface TemplateFormProps<T = AnyTemplate, U = AnyTemplateFormSubmittedValues> {
  template: T;
  onSubmit: (values: U) => Promise<unknown>;
  actions: TemplateFormActions<U>;
  temporaryLocation?: boolean;
}

export type AnyTemplateFormSubmittedValues =
  | TemplateCalloutFormSubmittedValues
  | TemplateSpaceFormSubmittedValues
  | TemplateCommunityGuidelinesFormSubmittedValues
  | TemplatePostFormSubmittedValues
  | TemplateWhiteboardFormSubmittedValues;

const TemplateForm = ({ template, ...rest }: AnyTemplateFormProps) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <TemplateCalloutForm template={template} {...rest} />;
    case TemplateType.Space:
      return <TemplateSpaceForm template={template} {...rest} />;
    case TemplateType.CommunityGuidelines:
      return <TemplateCommunityGuidelinesForm template={template} {...rest} />;
    case TemplateType.Post:
      return <TemplatePostForm template={template} {...rest} />;
    case TemplateType.Whiteboard:
      return <TemplateWhiteboardForm template={template} {...rest} />;
  }
  throw new Error('Template type not supported');
};

export default TemplateForm;
