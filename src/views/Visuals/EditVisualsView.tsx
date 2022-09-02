import React, { FC } from 'react';
import { Box } from '@mui/material';
import { Visual } from '../../models/graphql-schema';
import VisualUpload from '../../common/components/composite/common/VisualUpload/VisualUpload';
import { getVisualByType } from '../../common/utils/visuals.utils';
import { VisualName } from '../../models/constants/visuals.constants';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

export interface EditVisualsViewProps {
  visuals?: Visual[];
}

const EditVisualsView: FC<EditVisualsViewProps> = ({ visuals }) => {
  const { t } = useTranslation();
  const banner = getVisualByType(VisualName.BANNER, visuals);
  const bannerNarrow = getVisualByType(VisualName.BANNERNARROW, visuals);

  return (
    <>
      <Box display={'flex'} flexDirection={'row'} paddingBottom={3}>
        <VisualUpload visual={banner} />
        <Box paddingLeft={2}>
          <Typography variant={'h4'}>{t('pages.visual-edit.banner.title')}</Typography>
          <Typography variant={'subtitle2'}>
            {t('pages.visual-edit.banner.description1', { width: banner?.maxWidth, height: banner?.maxHeight })}
          </Typography>
          <Typography variant={'subtitle1'}>{t('pages.visual-edit.banner.description2')}</Typography>
        </Box>
      </Box>
      <Box display={'flex'} flexDirection={'row'} paddingBottom={3}>
        <VisualUpload visual={bannerNarrow} />
        <Box paddingLeft={2}>
          <Typography variant={'h4'}>{t('pages.visual-edit.banner-narrow.title')}</Typography>
          <Typography variant={'subtitle2'}>
            {t('pages.visual-edit.banner-narrow.description1', {
              width: bannerNarrow?.maxWidth,
              height: bannerNarrow?.maxHeight,
            })}
          </Typography>
          <Typography variant={'subtitle1'}>{t('pages.visual-edit.banner-narrow.description2')}</Typography>
        </Box>
      </Box>
    </>
  );
};

export default EditVisualsView;
