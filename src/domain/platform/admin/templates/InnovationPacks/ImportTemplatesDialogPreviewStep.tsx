import { Box, Button, Grid } from '@mui/material';
import React, { ComponentType, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TemplateImportCardComponentProps } from './ImportTemplatesDialogGalleryStep';
import { Template, TemplatePreviewProps } from '../AdminTemplatesSection';
import GridProvider from '../../../../../core/ui/grid/GridProvider';
import { Identifiable } from '../../../../../core/utils/Identifiable';

export interface ImportTemplatesDialogPreviewStepProps<T extends Template, V extends T> {
  onClose: () => void;
  template: T & Identifiable;
  templatePreviewCardComponent: ComponentType<TemplateImportCardComponentProps<T & Identifiable>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T, V>>;
  getImportedTemplateContent?: (template: T) => void;
  importedTemplateContent?: V | undefined;
  actions?: ReactNode;
}

const ImportTemplatesDialogPreviewStep = <T extends Template, V extends T>({
  template,
  templatePreviewCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  getImportedTemplateContent,
  importedTemplateContent,
  actions,
  onClose,
}: ImportTemplatesDialogPreviewStepProps<T, V>) => {
  const { t } = useTranslation();

  const getTemplateContent = useCallback(
    () => (getImportedTemplateContent ? getImportedTemplateContent(template) : undefined),
    [getImportedTemplateContent, template]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <GridProvider columns={3}>
          <TemplateCard template={template} />
        </GridProvider>
        <Box sx={{ display: 'flex', marginY: theme => theme.spacing(2), justifyContent: 'end' }}>
          <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => onClose()}>
            {t('buttons.back')}
          </Button>
          {actions}
        </Box>
      </Grid>
      <Grid item xs={12} md={9}>
        <TemplatePreview
          template={template}
          getTemplateContent={getTemplateContent}
          templateContent={importedTemplateContent}
        />
      </Grid>
    </Grid>
  );
};

export default ImportTemplatesDialogPreviewStep;
