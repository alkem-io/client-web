import React from 'react';
import { useTranslation } from 'react-i18next';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { PostTemplate } from '@/domain/templates/models/PostTemplate';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { TemplateFormActions } from '../Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';

export interface TemplatePostFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  postDefaultDescription?: string;
}

interface TemplatePostFormProps {
  template?: PostTemplate;
  onSubmit: (values: TemplatePostFormSubmittedValues) => void;
  actions: TemplateFormActions<TemplatePostFormSubmittedValues>;
  temporaryLocation?: boolean;
}

const validator = {
  postDefaultDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
};

const TemplatePostForm = ({ template, onSubmit, actions, temporaryLocation = false }: TemplatePostFormProps) => {
  const { t } = useTranslation();

  const initialValues: TemplatePostFormSubmittedValues = {
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

export default TemplatePostForm;
