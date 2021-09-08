import clsx from 'clsx';
import React, { FC } from 'react';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { OrganizationVerificationEnum } from '../../../../models/graphql-schema';
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

const OrganisationVerifiedState: FC<Props> = ({ state }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const isVerified = state === OrganizationVerificationEnum.ManualAttestation;
  const translation = `components.organisation-verified.${isVerified ? 'verified' : 'not-verified'}`;
  const stateColor = isVerified ? styles.verified : styles.notVerified;

  return (
    <Typography className={clsx(styles.root, stateColor)} variant={'overline'} noWrap>
      {t(translation)}
    </Typography>
  );
};
export default OrganisationVerifiedState;
