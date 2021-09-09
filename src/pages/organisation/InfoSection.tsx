import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/Link';
import EmailIcon from '@material-ui/icons/MailOutline';
import { Organisation, OrganizationVerificationEnum, User } from '../../models/graphql-schema';
import { OrganisationVerifiedState } from '../../components/composite';
import { Loading } from '../../components/core';
import AvatarContainer from '../../components/core/AvatarContainer';
import Avatar from '../../components/core/Avatar';
import { useTranslation } from 'react-i18next';

interface Props {
  organisation?: Organisation;
  owners?: User[];
}

const InfoSection: FC<Props> = ({ organisation, owners = [] }) => {
  const { t } = useTranslation();

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
      <Grid container item>
        <AvatarContainer title={t('pages.organisation.owners.title')}>
          {owners.map(({ id, profile, displayName }, i) => (
            <Avatar key={i} src={profile?.avatar} name={displayName} userId={id} />
          ))}
          {!owners.length && <Typography>{t('pages.organisation.owners.no-owners')}</Typography>}
        </AvatarContainer>
      </Grid>
    </Grid>
  );
};
export default InfoSection;
