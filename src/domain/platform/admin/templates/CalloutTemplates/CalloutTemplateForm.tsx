import React, { ReactNode } from 'react';
import { FormikProps } from 'formik';
import { CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateForm from '../TemplateForm';

export interface CalloutTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
}

export interface CalloutTemplateFormSubmittedValues {
  visualUri?: string;
  profile: CreateProfileInput;
  tags?: string[];
}

interface CalloutTemplateFormProps {
  initialValues: Partial<CalloutTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: CalloutTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CalloutTemplateFormValues>) => ReactNode);
  loading?: boolean;
}

const validator = {};

const CalloutTemplateForm = ({ initialValues, visual, onSubmit, actions }: CalloutTemplateFormProps) => {
  return (
    <TemplateForm
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    />
  );
};

export default CalloutTemplateForm;
