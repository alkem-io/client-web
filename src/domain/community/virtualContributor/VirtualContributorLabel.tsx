import { CaptionSmall } from '../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import { ReactComponent as VirtualContributorIcon } from './VirtualContributor.svg';
import { SvgIcon } from '@mui/material';
import { gutters } from '../../../core/ui/grid/utils';

const VirtualContributorLabel = () => {
  const { t } = useTranslation();

  return (
    <CaptionSmall sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      <SvgIcon
        component={VirtualContributorIcon}
        sx={{ width: gutters(0.75), height: gutters(0.75), marginBottom: 0.2 }}
      />
      {t('community.virtualContributor')}
    </CaptionSmall>
  );
};

export default VirtualContributorLabel;
