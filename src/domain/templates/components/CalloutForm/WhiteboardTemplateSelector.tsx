import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Box, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FormikWhiteboardPreview from '../../../collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import EmptyWhiteboard from '../../../common/whiteboard/EmptyWhiteboard';
import { gutters } from '../../../../core/ui/grid/utils';
import { useTemplateContentLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Identifiable } from '../../../../core/utils/Identifiable';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { LoadingButton } from '@mui/lab';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { LibraryIcon } from '../../LibraryIcon';

interface WhiteboardTemplatesSelectorProps {
  name: string;
}

export const WhiteboardTemplateSelector: FC<WhiteboardTemplatesSelectorProps> = ({ name }) => {
  const { t } = useTranslation();
  const [, , helpers] = useField<String>(name);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const handleResetWhiteboardTemplate = () => {
    helpers.setValue(JSON.stringify(EmptyWhiteboard));
  };

  const handleChange = (newContent: string) => {
    helpers.setValue(newContent);
  };

  const [getTemplateContent] = useTemplateContentLazyQuery();
  const handleSelectTemplate = async ({ id: templateId }: Identifiable): Promise<void> => {
    const { data } = await getTemplateContent({ variables: { templateId, includeWhiteboard: true } });
    if (data?.lookup.template?.whiteboard?.content) {
      helpers.setValue(data?.lookup.template?.whiteboard?.content);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Box sx={{ marginLeft: 'auto' }}>
          <Button onClick={handleResetWhiteboardTemplate} startIcon={<RestartAltIcon />}>
            {t('components.callout-creation.template-step.whiteboard-reset-template')}
          </Button>
          <Button onClick={() => setDialogOpen(true)} startIcon={<LibraryIcon />}>
            {t('buttons.find-template')}
          </Button>
          <ImportTemplatesDialog
            templateType={TemplateType.Whiteboard}
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
      </Box>
      <FormikWhiteboardPreview
        name={`${name}`}
        canEdit
        onChangeContent={handleChange}
        maxHeight={gutters(12)}
        dialogProps={{ title: t('templateLibrary.whiteboardTemplates.editTemplateButton') }}
      />
    </>
  );
};

export default WhiteboardTemplateSelector;
