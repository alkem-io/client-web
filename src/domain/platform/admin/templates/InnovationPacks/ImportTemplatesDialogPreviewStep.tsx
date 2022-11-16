import { Box, Button, Grid } from '@mui/material';
import React, { ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { TemplateImportCardComponentProps } from './ImportTemplatesDialogGalleryStep';
import { Template, TemplatePreviewProps } from '../AdminTemplatesSection';
import { TemplateFromInnovationPack } from './InnovationPack';

export interface ImportTemplatesDialogPreviewStepProps<T extends Template, Q extends T & TemplateFromInnovationPack> {
  onImportTemplate: (template: T) => Promise<void>;
  onClose: () => void;
  template: any;
  /*template: Q;*/
  templatePreviewCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T>>;
}

const ImportTemplatesDialogPreviewStep = <T extends Template, Q extends T & TemplateFromInnovationPack>({
  template,
  templatePreviewCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  onImportTemplate,
  onClose,
}: ImportTemplatesDialogPreviewStepProps<T, Q>) => {
  const { t } = useTranslation();

  const [importingTemplate, setImporting] = useState(false);

  const handleClickImport = async () => {
    setImporting(true);
    await onImportTemplate(template);
    setImporting(false);
    onClose();
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <TemplateCard template={template} />
        <Box sx={{ display: 'flex', marginY: theme => theme.spacing(2), justifyContent: 'end' }}>
          <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => onClose()}>
            {t('buttons.back')}
          </Button>
          <Button
            startIcon={<SystemUpdateAltIcon />}
            variant="contained"
            onClick={handleClickImport}
            disabled={importingTemplate}
            sx={{ marginLeft: theme => theme.spacing(1) }}
          >
            {importingTemplate ? t('buttons.importing') : t('buttons.import')}
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12} md={9}>
        <TemplatePreview template={template} />
      </Grid>
    </Grid>
  );
};

export default ImportTemplatesDialogPreviewStep;
