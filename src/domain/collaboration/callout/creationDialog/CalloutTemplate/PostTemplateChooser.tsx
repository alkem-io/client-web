import { Box } from '@mui/material';
import { useField } from 'formik';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import { Caption, CardText } from '../../../../../core/ui/typography';
import { PostTemplateWithValue } from '../../../post/PostTemplateCard/PostTemplate';
import PostTemplatesLibrary from '../../../post/PostTemplatesLibrary/PostTemplatesLibrary';

interface PostTemplatesChooserProps {
  name: string;
}

export const PostTemplatesChooser: FC<PostTemplatesChooserProps> = ({ name }) => {
  const { t } = useTranslation();
  const [, , helpers] = useField<String>(name);

  const handleSelectTemplate = (template: PostTemplateWithValue) => {
    helpers.setValue(template.defaultDescription);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box>
          <Caption>{t('components.callout-creation.template-step.post-template-label')}</Caption>
          <CardText>{t('components.callout-creation.template-step.post-template-text')}</CardText>
        </Box>
        <Box sx={{ marginLeft: 'auto' }}>
          <PostTemplatesLibrary onSelectTemplate={handleSelectTemplate} />
        </Box>
      </Box>
      <FormikMarkdownField
        name={`${name}`}
        title={t('components.callout-creation.template-step.post-template-default-description')}
        maxLength={MARKDOWN_TEXT_LENGTH}
      />
    </>
  );
};

export default PostTemplatesChooser;
