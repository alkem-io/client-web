import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BlockTitle } from '@/core/ui/typography';
import { BeenhereOutlined } from '@mui/icons-material';

type VerifiedStatusProps = {
  verified: boolean;
  to?: string;
  helpText?: string;
};

export const OrganizationVerifiedStatus = ({ verified, helpText }: VerifiedStatusProps) => {
  const { t } = useTranslation();

  return (
    <BlockTitle sx={{ display: 'flex', alignItems: 'center', columnGap: 0.5 }}>
      {helpText && verified && (
        <Tooltip title={helpText} arrow placement="right">
          <BeenhereOutlined fontSize="small" color="primary" />
        </Tooltip>
      )}
      {verified ? t('common.verified-status.verified') : t('common.verified-status.not-verified')}
    </BlockTitle>
  );
};

export default OrganizationVerifiedStatus;
