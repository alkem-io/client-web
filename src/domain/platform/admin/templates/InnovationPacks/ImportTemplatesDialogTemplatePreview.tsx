import { Box, Button, Grid } from '@mui/material';
import React, { ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { InnovationPackTemplatesData, InnovationPackTemplateViewModel } from './InnovationPack';
import { TemplateImportCardComponentProps } from './ImportTemplatesDialogTemplatesGallery';
import { TemplatePreviewProps } from '../AdminTemplatesSection';
import { TemplateInfoFragment } from '../../../../../models/graphql-schema';

export interface ImportTemplatesDialogTemplatePreviewProps {
  onSelectTemplate: (template: InnovationPackTemplatesData) => Promise<void>;
  onClose: () => void;
  template: InnovationPackTemplateViewModel;
  templatePreviewCardComponent: ComponentType<TemplateImportCardComponentProps>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<{ id: string; info: TemplateInfoFragment }>>;
}

const ImportTemplatesDialogTemplatePreview = ({
  template,
  templatePreviewCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  onSelectTemplate,
  onClose,
}: ImportTemplatesDialogTemplatePreviewProps) => {
  const { t } = useTranslation();

  const [importingTemplate, setImporting] = useState(false);

  const handleClickImport = async () => {
    setImporting(true);
    await onSelectTemplate(template);
    setImporting(false);
    onClose();
  };

  return (
    <Grid container>
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
          >
            {importingTemplate ? t('buttons.importing') : t('buttons.import')}
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12} md={9}>
        <TemplatePreview open template={template} onClose={onClose} />
      </Grid>
    </Grid>
  );
};

export default ImportTemplatesDialogTemplatePreview;
