import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../../../core/ui/grid/utils';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Caption } from '../../../../../../core/ui/typography';
import { Box } from '@mui/material';

const DisabledTemplateInfo = () => {
  const { t } = useTranslation();
  return (
    <Box display="flex" gap={gutters(0.5)}>
      <InfoOutlinedIcon />
      <Caption>{t('templateLibrary.disabledTemplateInfo')}</Caption>
    </Box>
  );
};

export default DisabledTemplateInfo;