import clsx from 'clsx';
import React, { FC } from 'react';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { OrganizationVerificationEnum } from '../../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    border: '1px solid',
    fontWeight: theme.typography.fontWeightBold,

    verified: {
      borderColor: theme.palette.success.main,
    },
    notVerified: {
      borderColor: theme.palette.error.main,
    },
  },
  verified: {
    color: theme.palette.success.main,
  },
  notVerified: {
    color: theme.palette.error.main,
  },
}));

interface Props {
  state: OrganizationVerificationEnum;
}

const OrganizationVerifiedState: FC<Props> = ({ state }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const isVerified = state === OrganizationVerificationEnum.VerifiedManualAttestation;
  const translation = `components.organization-verified.${isVerified ? 'verified' : 'not-verified'}` as const;
  const stateColor = isVerified ? styles.verified : styles.notVerified;

  return (
    <Typography className={clsx(styles.root, stateColor)} variant={'overline'} noWrap>
      {t(translation)}
    </Typography>
  );
};
export default OrganizationVerifiedState;
