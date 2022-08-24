import React, { forwardRef, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import { InputLabel, InputLabelProps } from '@mui/material';
import FormikInputField from '../../../../components/composite/forms/FormikInputField';
import { CreateTemplateInfoInput, Visual } from '../../../../models/graphql-schema';
import TemplateFormRows from '../TemplateFormRows';
import FormikMarkdownField from '../../../../components/composite/forms/FormikMarkdownField';
import { VERY_LONG_TEXT_LENGTH } from '../../../../models/constants/field-length.constants';
import TemplateForm from '../TemplateForm';

const InputLabelSmall = forwardRef<HTMLLabelElement, InputLabelProps>((props, ref) => (
  <InputLabel ref={ref} shrink {...props} sx={{ marginTop: '-0.5rem' }} />
));

export interface AspectTemplateFormValues {
  title: string;
  description: string;
  tags: string[];
  type: string;
  defaultDescription: string;
}

export interface AspectTemplateFormSubmittedValues {
  defaultDescription: string;
  type: string;
  info: CreateTemplateInfoInput;
}

interface AspectTemplateFormProps {
  title: ReactNode;
  initialValues: Partial<AspectTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: AspectTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<AspectTemplateFormValues>) => ReactNode);
}

const validator = {
  defaultDescription: yup.string().required(),
  type: yup.string().required(),
};

const AspectTemplateForm = ({ title, initialValues, visual, onSubmit, actions }: AspectTemplateFormProps) => {
  const { t } = useTranslation();

  return (
    <TemplateForm
      title={title}
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      <TemplateFormRows>
        <FormikInputField name="type" title={t('aspect-edit.type.title')} />
        <FormikMarkdownField
          name="defaultDescription"
          title={t('aspect-templates.default-description')}
          inputLabelComponent={InputLabelSmall}
          maxLength={VERY_LONG_TEXT_LENGTH}
          withCounter
        />
      </TemplateFormRows>
    </TemplateForm>
  );
};

export default AspectTemplateForm;
