import { ReactNode } from 'react';
import { FormikProps } from 'formik';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { AnyTemplate } from '../../models/TemplateBase';
import CalloutTemplateForm, { CalloutTemplateFormSubmittedValues } from './CalloutTemplateForm';
import CommunityGuidelinesTemplateForm, {
  CommunityGuidelinesTemplateFormSubmittedValues,
} from './CommunityGuidelinesTemplateForm';
import PostTemplateForm, { PostTemplateFormSubmittedValues } from './PostTemplateForm';
import InnovationFlowTemplateForm, { InnovationFlowTemplateFormSubmittedValues } from './InnovationFlowTemplateForm';
import WhiteboardTemplateForm, { WhiteboardTemplateFormSubmittedValues } from './WhiteboardTemplateForm';

interface TemplateFormProps {
  template: AnyTemplate;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<AnyTemplate>) => ReactNode);
}

export type AnyTemplateFormSubmittedValues =
  | CalloutTemplateFormSubmittedValues
  | CommunityGuidelinesTemplateFormSubmittedValues
  | PostTemplateFormSubmittedValues
  | InnovationFlowTemplateFormSubmittedValues
  | WhiteboardTemplateFormSubmittedValues;

const TemplateForm = ({ template, ...rest }: TemplateFormProps) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <CalloutTemplateForm template={template} {...rest} />;
    case TemplateType.CommunityGuidelines:
      return <CommunityGuidelinesTemplateForm template={template} {...rest} />;
    case TemplateType.Post:
      return <PostTemplateForm template={template} {...rest} />;
    case TemplateType.InnovationFlow:
      return <InnovationFlowTemplateForm template={template} {...rest} />;
    case TemplateType.Whiteboard:
      return <WhiteboardTemplateForm template={template} {...rest} />;
  }
  throw new Error('Template type not supported');
};

export default TemplateForm;
