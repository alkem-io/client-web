import React, { ReactNode } from 'react';

import { FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';

import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';

import { type PostTemplate } from '../../models/PostTemplate';
import { mapTemplateProfileToUpdateProfile } from './common/mappings';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';

const validator = {
  postDefaultDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
};

const PostTemplateForm = ({ actions, template, temporaryLocation = false, onSubmit }: PostTemplateFormProps) => {
  const { t } = useTranslation();

  const initialValues: PostTemplateFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfile(template?.profile),
    postDefaultDescription: template?.postDefaultDescription ?? '',
  };

  return (
    <TemplateFormBase
      actions={actions}
      template={template}
      validator={validator}
      initialValues={initialValues}
      templateType={TemplateType.Post}
      onSubmit={onSubmit}
    >
      <FormikMarkdownField
        name="postDefaultDescription"
        maxLength={MARKDOWN_TEXT_LENGTH}
        temporaryLocation={temporaryLocation}
        title={t('templateLibrary.postTemplates.defaultDescription')}
      />
    </TemplateFormBase>
  );
};

export default PostTemplateForm;

type PostTemplateFormProps = {
  temporaryLocation?: boolean;
  onSubmit: (values: PostTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<PostTemplateFormSubmittedValues>) => ReactNode);

  template?: PostTemplate;
};

export interface PostTemplateFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  postDefaultDescription?: string;
}
