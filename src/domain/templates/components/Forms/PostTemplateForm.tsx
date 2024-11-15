import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { PostTemplate } from '../../models/PostTemplate';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { mapTemplateProfileToUpdateProfile } from './common/mappings';

export interface PostTemplateFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  postDefaultDescription?: string;
}

interface PostTemplateFormProps {
  template?: PostTemplate;
  onSubmit: (values: PostTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<PostTemplateFormSubmittedValues>) => ReactNode);
  temporaryLocation?: boolean;
}

const validator = {
  postDefaultDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
};

const PostTemplateForm = ({ template, onSubmit, actions, temporaryLocation = false }: PostTemplateFormProps) => {
  const { t } = useTranslation();

  const initialValues: PostTemplateFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfile(template?.profile),
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
