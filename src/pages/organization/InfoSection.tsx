import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/Link';
import EmailIcon from '@material-ui/icons/MailOutline';
import { OrganizationInfoFragment, OrganizationVerificationEnum } from '../../models/graphql-schema';
import { OrganizationVerifiedState } from '../../components/composite';
import { Loading } from '../../components/core';
import TagContainer from '../../components/core/TagContainer';
import Tag from '../../components/core/Tag';
import { useTranslation } from 'react-i18next';

interface Props {
  organization?: OrganizationInfoFragment;
}

const InfoSection: FC<Props> = ({ organization }) => {
  const { t } = useTranslation();

  if (!organization) {
    return <Loading text={''} />;
  }

  const { contactEmail, website, verified = OrganizationVerificationEnum.NotVerified, profile } = organization;
  const tags = profile?.tagsets?.flatMap(x => x.tags) || [];

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
          <OrganizationVerifiedState state={verified} />
        </Grid>
      </Grid>
      <Grid container item>
        {tags.length > 0 ? (
          <TagContainer>
            {tags.map((t, i) => (
              <Tag key={i} text={t} color="neutralMedium" />
            ))}
          </TagContainer>
        ) : (
          <span>{t('common.no-tags')}</span>
        )}
      </Grid>
    </Grid>
  );
};
export default InfoSection;
