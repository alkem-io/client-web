import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import type { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import type { TemplateFormActions } from '../Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';
import TemplateCalloutForm, { type TemplateCalloutFormSubmittedValues } from './TemplateCalloutForm';
import TemplateCommunityGuidelinesForm, {
  type TemplateCommunityGuidelinesFormSubmittedValues,
} from './TemplateCommunityGuidelinesForm';
import TemplatePostForm, { type TemplatePostFormSubmittedValues } from './TemplatePostForm';
import TemplateSpaceForm, { type TemplateSpaceFormSubmittedValues } from './TemplateSpaceForm';
import TemplateWhiteboardForm, { type TemplateWhiteboardFormSubmittedValues } from './TemplateWhiteboardForm';

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
