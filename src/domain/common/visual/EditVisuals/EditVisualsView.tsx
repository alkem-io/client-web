import React, { FC } from 'react';
import { Box } from '@mui/material';
import { Visual, VisualType } from '@core/apollo/generated/graphql-schema';
import VisualUpload from '@core/ui/upload/VisualUpload/VisualUpload';
import { getVisualByType } from '../utils/visuals.utils';
import { VisualName } from '../constants/visuals.constants';
import { useTranslation } from 'react-i18next';
import VisualDescription from './VisualDescription';

export interface EditVisualsViewProps {
  visuals?: Visual[];
  visualTypes?: VisualType[];
}

const EditVisualsView: FC<EditVisualsViewProps> = ({ visuals, visualTypes }) => {
  const { t } = useTranslation();
  const avatar = getVisualByType(VisualName.AVATAR, visuals);
  const banner = getVisualByType(VisualName.BANNER, visuals);
  const cardBanner = getVisualByType(VisualName.CARD, visuals);

  return (
    <>
      {visualTypes?.includes(VisualType.Avatar) && (
        <Box display="flex" flexDirection="row" paddingBottom={3}>
          <VisualUpload
            visual={avatar}
            altText={t('pages.visualEdit.avatar.description', {
              alternativeText: avatar?.alternativeText,
            })}
          />
          <VisualDescription visualTypeName="avatar" visual={avatar} />
        </Box>
      )}
      {(!visualTypes || visualTypes.includes(VisualType.Banner)) && (
        <Box display={'flex'} flexDirection={'row'} paddingBottom={3}>
          <VisualUpload
            visual={banner}
            altText={t('pages.visualEdit.banner.description', {
              alternativeText: banner?.alternativeText,
            })}
          />
          <VisualDescription visualTypeName="banner" visual={banner} />
        </Box>
      )}
      {(!visualTypes || visualTypes.includes(VisualType.Card)) && (
        <Box display={'flex'} flexDirection={'row'} paddingBottom={3}>
          <VisualUpload
            visual={cardBanner}
            altText={t('pages.visualEdit.cardBanner.description', {
              alternativeText: cardBanner?.alternativeText,
            })}
          />
          <VisualDescription visualTypeName="cardBanner" visual={cardBanner} />
        </Box>
      )}
    </>
  );
};

export default EditVisualsView;
