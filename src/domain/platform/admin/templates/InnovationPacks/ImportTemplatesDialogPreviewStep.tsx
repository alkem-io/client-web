import { Box, Button, Grid } from '@mui/material';
import React, { ComponentType, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TemplateImportCardComponentProps } from './ImportTemplatesDialogGalleryStep';
import { Template, TemplatePreviewProps, TemplateValue } from '../AdminTemplatesSection';
import { TemplateInnovationPackMetaInfo } from './InnovationPack';
import GridProvider from '../../../../../core/ui/grid/GridProvider';

export interface ImportTemplatesDialogPreviewStepProps<
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo,
  V extends TemplateValue
> {
  onClose: () => void;
  template: Q;
  templatePreviewCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
  templatePreviewComponent: ComponentType<TemplatePreviewProps<T, V>>;
  getImportedTemplateValue?: (template: Q) => void;
  importedTemplateValue?: V | undefined;
  actions?: ReactNode;
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
  actions,
  onClose,
}: ImportTemplatesDialogPreviewStepProps<T, Q, V>) => {
  const { t } = useTranslation();

  const getTemplateValue = useCallback(
    () => (getImportedTemplateValue ? getImportedTemplateValue(template) : undefined),
    [getImportedTemplateValue, template]
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
          getTemplateValue={getTemplateValue}
          templateValue={importedTemplateValue}
        />
      </Grid>
    </Grid>
  );
};

export default ImportTemplatesDialogPreviewStep;
