import React, { FC } from 'react';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { SectionSpacer } from '../../../../../../domain/shared/components/Section/Section';
import VisualUpload from '../../../../common/VisualUpload/VisualUpload';
import { Visual } from '../../../../../../models/graphql-schema';

export interface AspectVisualsStepViewProps {
  bannerNarrow: Visual;
}

const AspectVisualsStepView: FC<AspectVisualsStepViewProps> = ({ bannerNarrow }) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
        {t('components.aspect-creation.visuals-step.headline')}
      </Typography>
      <SectionSpacer double />
      <Typography variant="subtitle2">{t('components.aspect-creation.visuals-step.explanation')}</Typography>
      <SectionSpacer />
      <Box display="flex" flexDirection="row" paddingBottom={3}>
        <VisualUpload visual={bannerNarrow} />
        <Box paddingLeft={2}>
          <Typography variant="h4">{t('pages.visual-edit.banner.title')}</Typography>
          <Typography variant="subtitle2">
            {t('pages.visual-edit.banner.description1', {
              width: bannerNarrow?.maxWidth,
              height: bannerNarrow?.maxHeight,
            })}
          </Typography>
          <Typography variant="subtitle1">{t('pages.visual-edit.banner.description2')}</Typography>
        </Box>
      </Box>
      <Typography variant="subtitle2">{t('components.aspect-creation.visuals-step.bottom-note')}</Typography>
    </>
  );
};

export default AspectVisualsStepView;
