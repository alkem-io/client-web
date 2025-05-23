import { Box } from '@mui/material';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import VisualUpload from '@/core/ui/upload/VisualUpload/VisualUpload';
import { getVisualByType } from '../utils/visuals.utils';
import { useTranslation } from 'react-i18next';
import VisualDescription from './VisualDescription';
import { VisualModelFull } from '../model/VisualModel';

export interface EditVisualsViewProps {
  visuals?: VisualModelFull[];
  visualTypes?: VisualType[];
}

const EditVisualsView = ({ visuals, visualTypes }: EditVisualsViewProps) => {
  const { t } = useTranslation();
  const avatar = getVisualByType(VisualType.Avatar, visuals);
  const banner = getVisualByType(VisualType.Banner, visuals);
  const cardBanner = getVisualByType(VisualType.Card, visuals);

  return (
    <>
      {visualTypes?.includes(VisualType.Avatar) && (
        <Box display="flex" flexDirection="row" paddingBottom={3}>
          <VisualUpload
            visual={avatar}
            altText={t(`pages.visualEdit.${VisualType.Avatar}.description`, {
              alternativeText: avatar?.alternativeText,
            })}
          />
          <VisualDescription visualTypeName={VisualType.Avatar} visual={avatar} />
        </Box>
      )}
      {(!visualTypes || visualTypes.includes(VisualType.Banner)) && (
        <Box display={'flex'} flexDirection={'row'} paddingBottom={3}>
          <VisualUpload
            visual={banner}
            altText={t(`pages.visualEdit.${VisualType.Banner}.description`, {
              alternativeText: banner?.alternativeText,
            })}
          />
          <VisualDescription visualTypeName={VisualType.Banner} visual={banner} />
        </Box>
      )}
      {(!visualTypes || visualTypes.includes(VisualType.Card)) && (
        <Box display={'flex'} flexDirection={'row'} paddingBottom={3}>
          <VisualUpload
            visual={cardBanner}
            altText={t(`pages.visualEdit.${VisualType.Card}.description`, {
              alternativeText: cardBanner?.alternativeText,
            })}
          />
          <VisualDescription visualTypeName={VisualType.Card} visual={cardBanner} />
        </Box>
      )}
    </>
  );
};

export default EditVisualsView;
