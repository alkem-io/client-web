import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { AnyTemplate } from '@/domain/templates/models/TemplateBase';
import { FormikProps } from 'formik';
import { ReactNode } from 'react';
import TemplateContentCalloutForm, { TemplateContentCalloutFormSubmittedValues } from './TemplateContentCalloutForm';
import TemplateContentSpaceForm, { TemplateContentSpaceFormSubmittedValues } from './TemplateContentSpaceForm';
import TemplateContentCommunityGuidelinesForm, {
  TemplateContentCommunityGuidelinesFormSubmittedValues,
} from './TemplateContentCommunityGuidelinesForm';
import PostTemplateForm, { TemplateContentPostFormSubmittedValues } from './TemplateContentPostForm';
import WhiteboardTemplateForm, { WhiteboardTemplateFormSubmittedValues } from './WhiteboardTemplateForm';

interface TemplateFormProps {
  template: AnyTemplate;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<AnyTemplateFormSubmittedValues>) => ReactNode);
  temporaryLocation?: boolean;
}

export type AnyTemplateFormSubmittedValues =
  | TemplateContentCalloutFormSubmittedValues
  | TemplateContentSpaceFormSubmittedValues
  | TemplateContentCommunityGuidelinesFormSubmittedValues
  | TemplateContentPostFormSubmittedValues
  | WhiteboardTemplateFormSubmittedValues;

const TemplateForm = ({ template, temporaryLocation = false, ...rest }: TemplateFormProps) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <TemplateContentCalloutForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    case TemplateType.Space:
      return <TemplateContentSpaceForm template={template} {...rest} />;
    case TemplateType.CommunityGuidelines:
      return (
        <TemplateContentCommunityGuidelinesForm template={template} temporaryLocation={temporaryLocation} {...rest} />
      );
    case TemplateType.Post:
      return <PostTemplateForm template={template} temporaryLocation={temporaryLocation} {...rest} />;
    case TemplateType.Whiteboard:
      return <WhiteboardTemplateForm template={template} {...rest} />;
  }
  throw new Error('Template type not supported');
};

export default TemplateForm;
