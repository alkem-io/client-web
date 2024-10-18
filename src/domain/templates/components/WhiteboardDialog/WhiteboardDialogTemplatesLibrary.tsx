import { Box, Button, IconButton } from '@mui/material';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalGridColumns } from '../../../../core/ui/grid/constants';
import { gutters } from '../../../../core/ui/grid/utils';
import { LibraryIcon } from '../../LibraryIcon';
import { WhiteboardTemplateContent } from '../../models/WhiteboardTemplate';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { TemplateType } from '../../../../core/apollo/generated/graphql-schema';
import { useTemplateContentLazyQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Identifiable } from '../../../../core/utils/Identifiable';
export interface WhiteboardDialogTemplatesLibraryProps {
  editModeEnabled?: boolean;
  disabled?: boolean;
  onImportTemplate: (template: WhiteboardTemplateContent) => void;
}

const WhiteboardDialogTemplatesLibrary: FC<WhiteboardDialogTemplatesLibraryProps> = ({
  editModeEnabled = false,
  disabled,
  onImportTemplate,
}) => {
  const { t } = useTranslation();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const columns = useGlobalGridColumns();

  const [getTemplateContent] = useTemplateContentLazyQuery();
  const handleSelectTemplate = async ({ id: templateId }: Identifiable): Promise<void> => {
    const { data } = await getTemplateContent({ variables: { templateId, includeWhiteboard: true } });
    if (data?.lookup.template?.whiteboard?.content) {
      const templateData = {
        whiteboard: {
          content: data?.lookup.template?.whiteboard.content,
        },
      };
      onImportTemplate(templateData);
    }
    setDialogOpen(false);
  };

  return (
    <>
      {editModeEnabled && (
        <Box height={gutters()} display="flex" alignItems="center" marginLeft={gutters()}>
          {columns <= 4 ? (
            <IconButton
              color="primary"
              onClick={() => setDialogOpen(true)}
              aria-label={t('buttons.find-template')}
              disabled={disabled}
            >
              <LibraryIcon fontSize="small" />
            </IconButton>
          ) : (
            <Button
              variant="outlined"
              startIcon={<LibraryIcon />}
              onClick={() => setDialogOpen(true)}
              disabled={disabled}
            >
              {t('buttons.find-template')}
            </Button>
          )}
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
      )}
    </>
  );
};

export default WhiteboardDialogTemplatesLibrary;
