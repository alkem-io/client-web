import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import FormikInputField from '../../../../../common/components/composite/forms/FormikInputField';
import { CreateTemplateInfoInput, Visual } from '../../../../../models/graphql-schema';
import TemplateFormRows from '../TemplateFormRows';
import FormikMarkdownField from '../../../../../common/components/composite/forms/FormikMarkdownField';
import { LONG_MARKDOWN_TEXT_LENGTH } from '../../../../../models/constants/field-length.constants';
import TemplateForm from '../TemplateForm';

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
          maxLength={LONG_MARKDOWN_TEXT_LENGTH}
          withCounter
        />
      </TemplateFormRows>
    </TemplateForm>
  );
};

export default AspectTemplateForm;
