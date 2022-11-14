import { Grid, Skeleton } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { InnovationPackTemplatesData, InnovationPackTemplateViewModel } from './InnovationPack';

export interface TemplatePreviewProps {
  onSelectTemplate: (template: InnovationPackTemplatesData) => void;
  onClose: () => void;
  template: InnovationPackTemplateViewModel | undefined;
}

const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  const { t } = useTranslation();

  return (
    <Grid container>
      <Grid item xs={12}>
        {!template && <Skeleton variant="rectangular" />}
        {template && (
          <>
            <p>{t('common.preview')}...</p>
            {template.info.title}
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default TemplatePreview;
