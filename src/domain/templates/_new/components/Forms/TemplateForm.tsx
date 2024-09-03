import { FormikProps } from 'formik';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import { AnyTemplate } from '../../models/TemplateBase';
import PostTemplateForm, { PostTemplateFormSubmittedValues } from './PostTemplateForm';
import { ReactNode } from 'react';
import CalloutTemplateForm from './CalloutTemplateForm';

interface TemplateFormProps {
  template: AnyTemplate;
  onSubmit: (values: AnyTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<AnyTemplate>) => ReactNode);
}

export type AnyTemplateFormSubmittedValues = PostTemplateFormSubmittedValues

const TemplateForm = ({ template, ...rest }: TemplateFormProps) => {
  switch (template.type) {
    case TemplateType.Callout:
      return <CalloutTemplateForm template={template} {...rest} />
    case TemplateType.Post:
      return <PostTemplateForm template={template} {...rest} />
  }
  throw new Error('Template type not supported');
};

export default TemplateForm;
