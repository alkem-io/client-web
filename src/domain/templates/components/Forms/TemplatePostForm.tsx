import { useTranslation } from 'react-i18next';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownFieldLazy';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import type { PostTemplate } from '@/domain/templates/models/PostTemplate';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import type { TemplateFormProps } from './TemplateForm';
import TemplateFormBase, { type TemplateFormProfileSubmittedValues } from './TemplateFormBase';

export interface TemplatePostFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  postDefaultDescription?: string;
}

interface TemplatePostFormProps extends TemplateFormProps<PostTemplate, TemplatePostFormSubmittedValues> {}

const validator = {
  postDefaultDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
};

const TemplatePostForm = ({ template, onSubmit, actions, temporaryLocation = false }: TemplatePostFormProps) => {
  const { t } = useTranslation();

  const initialValues: TemplatePostFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfileInput(template.profile),
    postDefaultDescription: template.postDefaultDescription ?? '',
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
