import { Chip, makeStyles } from '@material-ui/core';
import React, { ElementType, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface VerifiedStatusProps {
  verified: boolean;
  to?: string;
}

const useVerifiedStatusStyles = makeStyles(theme => ({
  verified: {
    color: theme.palette.success.main,
    borderColor: theme.palette.success.main,
  },
  notVerified: {
    color: theme.palette.warning.main,
    borderColor: theme.palette.warning.main,
  },
}));

export const VerifiedStatus: FC<VerifiedStatusProps> = ({ verified, to }) => {
  const { t } = useTranslation();
  const styles = useVerifiedStatusStyles();

  const verifiedProps: { component?: ElementType; to?: string; clickable?: boolean } = to
    ? { component: Link, to, clickable: true }
    : {};

  return (
    <Chip
      classes={{
        colorPrimary: styles.verified,
        colorSecondary: styles.notVerified,
      }}
      label={verified ? t('common.verified-status.verified') : t('common.verified-status.not-verified')}
      size="small"
      variant="outlined"
      color={verified ? 'primary' : 'secondary'}
      {...verifiedProps}
    />
  );
};
export default VerifiedStatus;
