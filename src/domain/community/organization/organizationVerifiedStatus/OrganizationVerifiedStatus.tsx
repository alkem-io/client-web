import { Tooltip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Help } from '@mui/icons-material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';

interface VerifiedStatusProps {
  verified: boolean;
  to?: string;
  helpText?: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    icon: {
      marginLeft: theme.spacing(1),
    },
  })
);

export const OrganizationVerifiedStatus: FC<VerifiedStatusProps> = ({ verified, helpText }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const color = verified ? 'success' : 'warning';

  return (
    <WrapperTypography weight="bold" color={color}>
      {verified ? t('common.verified-status.verified') : t('common.verified-status.not-verified')}
      {helpText && verified && (
        <Tooltip title={helpText} arrow placement="right">
          <Help color="primary" className={styles.icon} />
        </Tooltip>
      )}
    </WrapperTypography>
  );
};

export default OrganizationVerifiedStatus;
