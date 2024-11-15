import { CaptionSmall } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { Chip, SvgIcon } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import VCIcon from './VirtualContributorsIcons';

const VirtualContributorLabel = ({ chip = false }) => {
  const { t } = useTranslation();

  if (chip) {
    return (
      <Chip
        color="primary"
        label={t('community.virtualContributor')}
        icon={<SvgIcon component={VCIcon} fill="white" sx={{ padding: '0 !important', margin: '0 4px !important' }} />}
      />
    );
  }

  return (
    <CaptionSmall sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      <SvgIcon component={VCIcon} sx={{ width: gutters(0.75), height: gutters(0.75), marginBottom: 0.2 }} />
      {t('community.virtualContributor')}
    </CaptionSmall>
  );
};

export default VirtualContributorLabel;
