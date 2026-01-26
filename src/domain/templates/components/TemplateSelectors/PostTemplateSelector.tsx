import { Box, Button } from '@mui/material';
import { useField } from 'formik';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Caption, CardText } from '@/core/ui/typography';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import TemplateActionButton from '../Buttons/TemplateActionButton';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';

interface PostTemplatesSelectorProps {
  name: string;
}

export const PostTemplateSelector: FC<PostTemplatesSelectorProps> = ({ name }) => {
  const { t } = useTranslation();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [, , helpers] = useField<String>(name);

  const [getTemplateContent] = useTemplateContentLazyQuery();
  const handleSelectTemplate = async ({ id: templateId }: Identifiable): Promise<void> => {
    const { data } = await getTemplateContent({ variables: { templateId, includePost: true } });
    if (data?.lookup.template?.postDefaultDescription) {
      helpers.setValue(data?.lookup.template?.postDefaultDescription);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box>
          <Caption>{t('components.callout-creation.template-step.post-template-label')}</Caption>
          <CardText>{t('components.callout-creation.template-step.post-template-text')}</CardText>
        </Box>
        <Box sx={{ marginLeft: 'auto' }}>
          <Button onClick={() => setDialogOpen(true)} startIcon={<LibraryIcon />}>
            {t('buttons.find-template')}
          </Button>
          <ImportTemplatesDialog
            templateType={TemplateType.Post}
            actionButton={() => <TemplateActionButton />}
            open={isDialogOpen}
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setDialogOpen(false)}
            enablePlatformTemplates
          />
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

export default PostTemplateSelector;
