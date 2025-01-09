import { Tooltip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import { BeenhereOutlined } from '@mui/icons-material';
import WrapperTypography from '@/core/ui/typography/deprecated/WrapperTypography';

type VerifiedStatusProps = {
  verified: boolean;
  to?: string;
  helpText?: string;
};

const useStyles = makeStyles(theme =>
  createStyles({
    icon: {
      marginLeft: theme.spacing(1),
    },
  })
);

export const OrganizationVerifiedStatus = ({ verified, helpText }: VerifiedStatusProps) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const color = verified ? 'success' : 'warning';

  return (
    <WrapperTypography weight="bold" color={color}>
      {verified ? t('common.verified-status.verified') : t('common.verified-status.not-verified')}
      {helpText && verified && (
        <Tooltip title={helpText} arrow placement="right">
          <BeenhereOutlined color="primary" className={styles.icon} />
        </Tooltip>
      )}
    </WrapperTypography>
  );
};

export default OrganizationVerifiedStatus;
