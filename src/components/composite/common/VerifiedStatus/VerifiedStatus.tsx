import { createStyles, makeStyles, Tooltip } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '../../../core/Typography';

interface VerifiedStatusProps {
  verified: boolean;
  to?: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    icon: {
      marginLeft: theme.spacing(1),
    },
  })
);

export const VerifiedStatus: FC<VerifiedStatusProps> = ({ verified }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const color = verified ? 'success' : 'warning';

  return (
    <Typography weight="bold" color={color}>
      {verified ? t('common.verified-status.verified') : t('common.verified-status.not-verified')}
      <Tooltip title={t('components.verified-status.help')} arrow placement="right">
        <Help color="primary" className={styles.icon} />
      </Tooltip>
    </Typography>
  );
};
export default VerifiedStatus;
