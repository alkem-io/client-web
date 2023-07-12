import React, { FC } from 'react';
import { Box } from '@mui/material';
import { Visual, VisualType } from '../../../../core/apollo/generated/graphql-schema';
import VisualUpload from '../../../../core/ui/upload/VisualUpload/VisualUpload';
import { getVisualByType } from '../utils/visuals.utils';
import { VisualName } from '../constants/visuals.constants';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle } from '../../../../core/ui/typography';

export interface EditVisualsViewProps {
  visuals?: Visual[];
  visualTypes?: VisualType[];
}

const EditVisualsView: FC<EditVisualsViewProps> = ({ visuals, visualTypes }) => {
  const { t } = useTranslation();
  const banner = getVisualByType(VisualName.BANNER, visuals);
  const bannerNarrow = getVisualByType(VisualName.BANNERNARROW, visuals);

  return (
    <>
      {(!visualTypes || visualTypes.includes(VisualType.Banner)) && (
        <Box display={'flex'} flexDirection={'row'} paddingBottom={3}>
          <VisualUpload
            visual={banner}
            altText={t('pages.visual-edit.banner.description', {
              alternativeText: banner?.alternativeText,
              interpolation: {
                escapeValue: false,
              },
            })}
          />
          <Box paddingLeft={2}>
            <BlockSectionTitle>{t('pages.visual-edit.banner.title')}</BlockSectionTitle>
            <BlockSectionTitle>
              {t('pages.visual-edit.banner.description1', { width: banner?.maxWidth, height: banner?.maxHeight })}
            </BlockSectionTitle>
            {banner?.alternativeText && (
              <BlockSectionTitle>
                {t('pages.visual-edit.banner.description', {
                  alternativeText: banner?.alternativeText,
                  interpolation: {
                    escapeValue: false,
                  },
                })}
              </BlockSectionTitle>
            )}
          </Box>
        </Box>
      )}
      {(!visualTypes || visualTypes.includes(VisualType.Card)) && (
        <Box display={'flex'} flexDirection={'row'} paddingBottom={3}>
          <VisualUpload
            visual={bannerNarrow}
            altText={t('pages.visual-edit.banner-narrow.description', {
              alternativeText: bannerNarrow?.alternativeText,
              interpolation: {
                escapeValue: false,
              },
            })}
          />
          <Box paddingLeft={2}>
            <BlockSectionTitle>{t('pages.visual-edit.banner-narrow.title')}</BlockSectionTitle>
            <BlockSectionTitle>
              {t('pages.visual-edit.banner-narrow.description1', {
                width: bannerNarrow?.maxWidth,
                height: bannerNarrow?.maxHeight,
              })}
            </BlockSectionTitle>
            {bannerNarrow?.alternativeText && (
              <BlockSectionTitle>
                {t('pages.visual-edit.banner-narrow.description', {
                  alternativeText: bannerNarrow?.alternativeText,
                  interpolation: {
                    escapeValue: false,
                  },
                })}
              </BlockSectionTitle>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default EditVisualsView;
