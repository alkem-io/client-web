import React, { FC } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/Link';
import EmailIcon from '@material-ui/icons/MailOutline';
import { OrganisationInfoFragment, OrganizationVerificationEnum } from '../../models/graphql-schema';
import { OrganisationVerifiedState } from '../../components/composite';
import { Loading } from '../../components/core';
import TagContainer from '../../components/core/TagContainer';
import Tag from '../../components/core/Tag';

interface Props {
  organisation?: OrganisationInfoFragment;
}

const InfoSection: FC<Props> = ({ organisation }) => {
  if (!organisation) {
    return <Loading text={''} />;
  }

  const { contactEmail, website, verified = OrganizationVerificationEnum.NotVerified, profile } = organisation;
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
          <OrganisationVerifiedState state={verified} />
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
          <span>No tags available</span>
        )}
      </Grid>
    </Grid>
  );
};
export default InfoSection;
