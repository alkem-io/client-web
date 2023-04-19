import { Box } from '@mui/material';
import { useField } from 'formik';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { LONG_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import { Caption, CardText } from '../../../../../core/ui/typography';
import { PostTemplateFormSubmittedValues } from '../../../../platform/admin/templates/PostTemplates/PostTemplateForm';
import { PostTemplateWithValue } from '../../../aspect/PostTemplatesLibrary/PostTemplate';
import PostTemplatesLibrary from '../../../aspect/PostTemplatesLibrary/PostTemplatesLibrary';

interface PostTemplatesChooserProps {
  name: string;
}

export const PostTemplatesChooser: FC<PostTemplatesChooserProps> = ({ name }) => {
  const { t } = useTranslation();
  const [, , helpers] = useField<PostTemplateFormSubmittedValues>(name);

  const handleSelectTemplate = (template: PostTemplateWithValue) => {
    helpers.setValue({
      profile: {
        displayName: t('components.callout-creation.custom-template'),
      },
      defaultDescription: template.defaultDescription,
      type: template.type,
    });
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box>
          <Caption>{t('components.callout-creation.template-step.card-template-label')}</Caption>
          <CardText>{t('components.callout-creation.template-step.card-template-text')}</CardText>
        </Box>
        <Box sx={{ marginLeft: 'auto' }}>
          <PostTemplatesLibrary onSelectTemplate={handleSelectTemplate} />
        </Box>
      </Box>
      <FormikMarkdownField
        name={`${name}.defaultDescription`}
        title={t('components.callout-creation.template-step.card-template-default-description')}
        maxLength={LONG_TEXT_LENGTH}
        withCounter
      />
    </>
  );
};

export default PostTemplatesChooser;
