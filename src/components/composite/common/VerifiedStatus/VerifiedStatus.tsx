import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '../../../core/Typography';

interface VerifiedStatusProps {
  verified: boolean;
  to?: string;
}

export const VerifiedStatus: FC<VerifiedStatusProps> = ({ verified }) => {
  const { t } = useTranslation();

  const color = verified ? 'success' : 'warning';

  return (
    <Typography weight="bold" color={color}>
      {verified ? t('common.verified-status.verified') : t('common.verified-status.not-verified')}
    </Typography>
  );
};
export default VerifiedStatus;
