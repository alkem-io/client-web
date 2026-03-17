import { Box, Button, IconButton } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTemplateContentLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useGlobalGridColumns } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import type { Identifiable } from '@/core/utils/Identifiable';
import { LibraryIcon } from '@/domain/templates/LibraryIcon';
import type { WhiteboardTemplateContent } from '@/domain/templates/models/WhiteboardTemplate';
import TemplateActionButton from '../Buttons/TemplateActionButton';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
export interface WhiteboardDialogTemplatesLibraryProps {
  editModeEnabled?: boolean;
  disabled?: boolean;
  onImportTemplate: (template: WhiteboardTemplateContent) => void;
}

const WhiteboardDialogTemplatesLibrary = ({
  editModeEnabled = false,
  disabled,
  onImportTemplate,
}: WhiteboardDialogTemplatesLibraryProps) => {
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
            actionButton={() => <TemplateActionButton />}
            open={isDialogOpen}
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setDialogOpen(false)}
            enablePlatformTemplates={true}
          />
        </Box>
      )}
    </>
  );
};

export default WhiteboardDialogTemplatesLibrary;
