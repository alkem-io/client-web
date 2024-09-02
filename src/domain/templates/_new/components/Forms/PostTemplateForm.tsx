import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormSubmittedValues, TemplateProfileValues } from './TemplateFormBase';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import { PostTemplate } from '../../models/PostTemplate';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';

export interface PostTemplateFormValues extends TemplateProfileValues {
  postDefaultDescription: string;
}

export interface PostTemplateFormSubmittedValues extends TemplateFormSubmittedValues {
  postDefaultDescription?: string;
}

interface PostTemplateFormProps {
  template?: PostTemplate;
  onSubmit: (values: PostTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<PostTemplateFormValues>) => ReactNode);
}

const validator = {
  postDefaultDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
};

const PostTemplateForm = ({ template, onSubmit, actions }: PostTemplateFormProps) => {
  const { t } = useTranslation();

  const initialValues: PostTemplateFormValues = {
    profile: {
      displayName: template?.profile.displayName ?? '',
      description: template?.profile.description ?? '',
      tagsets: template?.profile.tagset ? [template?.profile.tagset] : [],
    },
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
      />
    </TemplateFormBase>
  );
};

export default PostTemplateForm;
