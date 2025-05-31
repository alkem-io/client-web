import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { PostTemplate } from '@/domain/templates/models/PostTemplate';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';

export interface TemplateContentPostFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  postDefaultDescription?: string;
}

interface TemplateContentPostFormProps {
  template?: PostTemplate;
  onSubmit: (values: TemplateContentPostFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<TemplateContentPostFormSubmittedValues>) => ReactNode);
  temporaryLocation?: boolean;
}

const validator = {
  postDefaultDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
};

const PostTemplateForm = ({ template, onSubmit, actions, temporaryLocation = false }: TemplateContentPostFormProps) => {
  const { t } = useTranslation();

  const initialValues: TemplateContentPostFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfileInput(template?.profile),
    postDefaultDescription: template?.postDefaultDescription ?? '',
  };

  return (
    <TemplateFormBase
      templateType={TemplateType.Post}
      template={template}
      initialValues={initialValues}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      <FormikMarkdownField
        name="postDefaultDescription"
        title={t('templateLibrary.postTemplates.defaultDescription')}
        maxLength={MARKDOWN_TEXT_LENGTH}
        temporaryLocation={temporaryLocation}
      />
    </TemplateFormBase>
  );
};

export default PostTemplateForm;
