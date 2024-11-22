import { Box, Button } from '@mui/material';
import { useField } from 'formik';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { Identifiable } from '@/core/utils/Identifiable';
import Gutters, { GuttersProps } from '@/core/ui/grid/Gutters';

interface SubspaceTemplateSelectorProps extends GuttersProps {
  name: string;
}

export const SubspaceTemplateSelector: FC<SubspaceTemplateSelectorProps> = ({ name, ...rest }) => {
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
    <Gutters row {...rest}>
      <BlockSectionTitle>{t('context.subspace.template.title')}</BlockSectionTitle>
      <CardText>{t('components.callout-creation.template-step.post-template-text')}</CardText>
      <Box sx={{ marginLeft: 'auto' }}>
        <Button onClick={() => setDialogOpen(true)} startIcon={<LibraryIcon />} variant="outlined">
          {t('buttons.change-template')}
        </Button>
        <ImportTemplatesDialog
          templateType={TemplateType.Collaboration}
          actionButton={
            <LoadingButton startIcon={<SystemUpdateAltIcon />} variant="contained">
              {t('buttons.use')}
            </LoadingButton>
          }
          open={isDialogOpen}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setDialogOpen(false)}
          enablePlatformTemplates
        />
      </Box>
    </Gutters>
  );
};

export default SubspaceTemplateSelector;
