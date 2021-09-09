import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/Link';
import EmailIcon from '@material-ui/icons/MailOutline';
import { Organisation, OrganizationVerificationEnum } from '../../models/graphql-schema';
import { OrganisationVerifiedState } from '../../components/composite';
import { Loading } from '../../components/core';

interface Props {
  organisation?: Organisation;
}

const InfoSection: FC<Props> = ({ organisation }) => {
  if (!organisation) {
    return <Loading text={''} />;
  }

  const { contactEmail, website, verified = OrganizationVerificationEnum.NotVerified } = organisation;

  return (
    <Grid container spacing={1}>
      <Grid container item spacing={1}>
        {website && (
          <Grid item>
            <LinkIcon fontSize={'small'} />
            <Typography component={'a'} href={website}>
              {website}
            </Typography>
          </Grid>
        )}
        {contactEmail && (
          <Grid item>
            <EmailIcon fontSize={'small'} />
            <Typography component={'a'} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </Typography>
          </Grid>
        )}
        <Grid item>
          <OrganisationVerifiedState state={verified} />
        </Grid>
      </Grid>
    </Grid>
  );
};
export default InfoSection;
