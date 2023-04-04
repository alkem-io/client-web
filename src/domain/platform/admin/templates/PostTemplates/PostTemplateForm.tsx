import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { FormikProps } from 'formik';
import FormikInputField from '../../../../../common/components/composite/forms/FormikInputField';
import { CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateFormRows from '../TemplateFormRows';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { VERY_LONG_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import TemplateForm from '../TemplateForm';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';

//!! displayName and description are not geting updated, should be nested? there is an any outside here
export interface PostTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  type: string;
  defaultDescription: string;
}

export interface PostTemplateFormSubmittedValues {
  defaultDescription: string;
  type: string;
  profile: CreateProfileInput;
  tags?: string[];
  visualUri?: string;
}

interface PostTemplateFormProps {
  initialValues: Partial<PostTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: PostTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<PostTemplateFormValues>) => ReactNode);
}

const validator = {
  defaultDescription: MarkdownValidator(VERY_LONG_TEXT_LENGTH).required(),
  type: yup.string().required(),
};

const PostTemplateForm = ({ initialValues, visual, onSubmit, actions }: PostTemplateFormProps) => {
  const { t } = useTranslation();

  return (
    <TemplateForm
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
          maxLength={VERY_LONG_TEXT_LENGTH}
          withCounter
        />
      </TemplateFormRows>
    </TemplateForm>
  );
};

export default PostTemplateForm;
