import { Box, Button, IconButton } from '@mui/material';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalGridColumns } from '../../../../../core/ui/grid/constants';
import { gutters } from '../../../../../core/ui/grid/utils';
import { LibraryIcon } from '../../../LibraryIcon';
import { WhiteboardTemplateContent } from '../../models/WhiteboardTemplate';
import ImportTemplatesDialog from '../Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useImportTemplateDataLazyQuery,
  useSpaceTemplatesSetIdQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Identifiable } from '../../../../../core/utils/Identifiable';
export interface WhiteboardDialogTemplatesLibraryProps {
  editModeEnabled?: boolean;
  onImportTemplate: (template: WhiteboardTemplateContent) => void;
}

const WhiteboardDialogTemplatesLibrary: FC<WhiteboardDialogTemplatesLibraryProps> = ({
  editModeEnabled = false,
  onImportTemplate,
}) => {
  // This could be better... and maybe it doesn't work on subspaces properly
  const { spaceNameId } = useUrlParams();
  const { data } = useSpaceTemplatesSetIdQuery({
    variables: {
      spaceNameId: spaceNameId!,
    },
    skip: !spaceNameId,
  });
  const templatesSetId = data?.space.library?.id;

  const { t } = useTranslation();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const columns = useGlobalGridColumns();

  const [getTemplateData] = useImportTemplateDataLazyQuery();
  const handleSelectTemplate = async (template: Identifiable): Promise<void> => {
    const { data } = await getTemplateData({ variables: { templateId: template.id, includeWhiteboard: true } });
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
            <IconButton color="primary" onClick={() => setDialogOpen(true)} aria-label={t('buttons.find-template')}>
              <LibraryIcon fontSize="small" />
            </IconButton>
          ) : (
            <Button variant="outlined" startIcon={<LibraryIcon />} onClick={() => setDialogOpen(true)}>
              {t('buttons.find-template')}
            </Button>
          )}
          <ImportTemplatesDialog
            templateType={TemplateType.Whiteboard}
            templatesSetId={templatesSetId}
            allowBrowsePlatformTemplates
            actionButton={
              <LoadingButton startIcon={<SystemUpdateAltIcon />} variant="contained">
                {t('buttons.use')}
              </LoadingButton>
            }
            headerText={t('templateLibrary.whiteboardTemplates.title')}
            open={isDialogOpen}
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setDialogOpen(false)}
          />
        </Box>
      )}
    </>
  );
};

export default WhiteboardDialogTemplatesLibrary;
