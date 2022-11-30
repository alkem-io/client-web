import { Box, Button, Grid } from '@mui/material';
import React, { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { TemplateImportCardComponentProps } from './ImportTemplatesDialogGalleryStep';
import { Template, TemplatePreviewProps, TemplateValue } from '../AdminTemplatesSection';
import { TemplateInnovationPackMetaInfo } from './InnovationPack';
import useLoadingState from '../../../../../hooks/useLoadingState';

export interface ImportTemplatesDialogPreviewStepProps<
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo,
  V extends TemplateValue
> {
  onImportTemplate: (template: T, templateValue: V | undefined) => Promise<void>;
  onClose: () => void;
  template: Q;
  templatePreviewCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T, V>>;
  getImportedTemplateValue?: (template: T) => void;
  importedTemplateValue?: V | undefined;
}

const ImportTemplatesDialogPreviewStep = <
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo,
  V extends TemplateValue
>({
  template,
  templatePreviewCardComponent: TemplateCard,
  templatePreviewComponent: TemplatePreview,
  getImportedTemplateValue,
  importedTemplateValue,
  onImportTemplate,
  onClose,
}: ImportTemplatesDialogPreviewStepProps<T, Q, V>) => {
  const { t } = useTranslation();

  const [importingTemplate, doImportTemplate] = useLoadingState(() =>
    onImportTemplate(template, importedTemplateValue)
  );

  const handleClickImport = async () => {
    doImportTemplate();
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
        <TemplatePreview
          template={template}
          getTemplateValue={getImportedTemplateValue}
          templateValue={importedTemplateValue}
        />
      </Grid>
    </Grid>
  );
};

export default ImportTemplatesDialogPreviewStep;
