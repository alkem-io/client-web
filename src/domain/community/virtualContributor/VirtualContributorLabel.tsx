import { SmartToyOutlined } from '@mui/icons-material';
import { CaptionSmall } from '../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

const VirtualContributorLabel = () => {
  const { t } = useTranslation();

  return (
    <CaptionSmall sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      <SmartToyOutlined fontSize="inherit" />
      {t('community.virtualContributor')}
    </CaptionSmall>
  );
};

export default VirtualContributorLabel;
