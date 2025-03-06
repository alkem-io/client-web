import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import { FormikProps } from 'formik';
import { ReactNode } from 'react';
import CalloutTemplateForm, { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import CollaborationTemplateForm, { CollaborationTemplateFormSubmittedValues } from './CollaborationTemplateForm';
import CommunityGuidelinesTemplateForm, {
  CommunityGuidelinesTemplateFormSubmittedValues,
} from './CommunityGuidelinesTemplateForm';
import PostTemplateForm, { PostTemplateFormSubmittedValues } from './PostTemplateForm';
import WhiteboardTemplateForm, { WhiteboardTemplateFormSubmittedValues } from './WhiteboardTemplateForm';

interface TemplateFormProps {
  template: AnyTemplate;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<AnyTemplateFormSubmittedValues>) => ReactNode);
  temporaryLocation?: boolean;
}

export type AnyTemplateFormSubmittedValues =
  | CalloutTemplateFormSubmittedValues
  | CollaborationTemplateFormSubmittedValues
  | CommunityGuidelinesTemplateFormSubmittedValues
  | PostTemplateFormSubmittedValues
  | WhiteboardTemplateFormSubmittedValues;

const TemplateForm = ({ template, temporaryLocation = false, ...rest }: TemplateFormProps) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <CalloutTemplateForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    case TemplateType.Collaboration:
      return <CollaborationTemplateForm template={template} {...rest} />;
    case TemplateType.CommunityGuidelines:
      return <CommunityGuidelinesTemplateForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    case TemplateType.Post:
      return <PostTemplateForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    case TemplateType.Whiteboard:
      return <WhiteboardTemplateForm template={template} {...rest} />;
  }
  throw new Error('Template type not supported');
};

export default TemplateForm;
