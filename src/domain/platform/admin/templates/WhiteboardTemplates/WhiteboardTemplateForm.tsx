import React, { ReactNode } from 'react';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import { CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateFormRows from '../TemplateFormRows';
import TemplateForm from '../TemplateForm';
import FormikWhiteboardPreview from './FormikWhiteboardPreview';

export interface WhiteboardTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  value: string;
}

export interface WhiteboardTemplateFormSubmittedValues {
  value: string;
  visualUri?: string;
  profile: CreateProfileInput;
  tags?: string[];
}

interface WhiteboardTemplateFormProps {
  initialValues: Partial<WhiteboardTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: WhiteboardTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<WhiteboardTemplateFormValues>) => ReactNode);
  loading?: boolean;
}

const validator = {
  value: yup.string().required(),
};

const WhiteboardTemplateForm = ({ initialValues, visual, onSubmit, actions, loading }: WhiteboardTemplateFormProps) => {
  return (
    <TemplateForm
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      <TemplateFormRows>
        <FormikWhiteboardPreview name="value" canEdit loading={loading} />
      </TemplateFormRows>
    </TemplateForm>
  );
};

export default WhiteboardTemplateForm;
