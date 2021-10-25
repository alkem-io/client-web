import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  Grid,
  Link,
  makeStyles,
  Typography as MUITypography,
} from '@material-ui/core';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router-dom';
import { SettingsButton } from '../../components/composite';
import SocialLinks, { isSocialLink } from '../../components/composite/common/SocialLinks/SocialLinks';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import Typography from '../../components/core/Typography';
import { UserMetadata } from '../../hooks';
import { isSocialNetworkSupported, toSocialNetworkEnum } from '../../models/enums/SocialNetworks';
import AssociatedOrganizationsView from '../Organization/AssociatedOrganizationsView';
import { ContributionsView } from '../ProfileView';

// TODO [ATS]: It is Copy/Pasted from OrganizationProfileView reduce it if possible.
const Detail: FC<{ title: string; value?: string }> = ({ title, value }) => {
  if (!value) return null;
  return (
    <>
      <Typography color="primary" weight="boldLight">
        {title}
      </Typography>
      <Typography>{value}</Typography>
    </>
  );
};

export interface UserProfileViewProps {
  entities: {
    userMetadata: UserMetadata;
    verified: boolean;
  };
  options?: {
    isCurrentUser?: boolean;
  };
}

const defaultOptions: UserProfileViewProps['options'] = {
  isCurrentUser: false,
};

const PADDING_LEFT = 4;
const PADDING_RIGHT = 4;

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.neutralLight.main,
    },
    cardHeader: {
      padding: theme.spacing(1),
    },
    cardHeaderAction: {
      margin: 0,
      paddingRight: theme.spacing(3),
    },
    media: {
      background: theme.palette.neutralMedium.main,
      height: 140,
    },
    content: {
      paddingLeft: theme.spacing(PADDING_LEFT),
      paddingRight: theme.spacing(PADDING_RIGHT),
    },
    avatar: {
      width: theme.spacing(20.5),
      height: theme.spacing(20.5),
    },
    header: {
      alignItems: 'flex-start',
      paddingTop: theme.spacing(4),
      paddingLeft: theme.spacing(PADDING_LEFT),
      paddingRight: theme.spacing(PADDING_RIGHT),
    },
    headerTitle: {
      display: 'flex',
    },
    headerAction: {},
  })
);

export const UserProfileView: FC<UserProfileViewProps> = ({ entities: { userMetadata }, options }) => {
  const { url } = useRouteMatch();
  const { t } = useTranslation();
  const { user, contributions, pendingApplications, keywords, skills } = userMetadata;
  const styles = useStyles();
  const references = user.profile?.references;
  const bio = user.profile?.description;
  const { displayName, city, country, phone } = user;

  const { isCurrentUser } = { ...defaultOptions, ...options };

  const location = [city, country].filter(x => !!x).join(', ');

  const socialLinks = useMemo(() => {
    const result = (references || [])
      .map(s => ({
        type: toSocialNetworkEnum(s.name),
        url: s.uri,
      }))
      .filter(isSocialLink);

    return result;
  }, [references]);

  const links = useMemo(() => {
    let result = (references || []).filter(x => !isSocialNetworkSupported(x.name)).map(s => s.uri);

    return result;
  }, [references]);

  return (
    <Grid container spacing={2}>
      <Grid item container xs={12} xl={6} direction="column" spacing={2}>
        <Grid item>
          <Card elevation={0} className={styles.card}>
            <CardHeader
              classes={{
                action: styles.headerAction,
                title: styles.headerTitle,
              }}
              avatar={
                <>
                  <Avatar variant="square" src={user.profile?.avatar} className={styles.avatar}>
                    {user.firstName[0]}
                  </Avatar>
                  <Box paddingTop={1}>
                    <SocialLinks title="" items={socialLinks} />
                  </Box>
                </>
              }
              className={styles.header}
              action={
                isCurrentUser && (
                  <SettingsButton
                    color={'primary'}
                    to={`${url}/edit`}
                    tooltip={t('pages.user-profile.tooltips.settings')}
                  />
                )
              }
              title={
                <Grid container spacing={1} direction="column">
                  <Grid item>
                    <MUITypography variant="h2">{displayName}</MUITypography>
                  </Grid>
                  <Grid item>
                    <Detail title={t('components.profile.fields.location.title')} value={location} />
                  </Grid>
                  <Grid item>
                    <Detail title={t('components.profile.fields.work.title')} value={'work work'} />
                  </Grid>
                  <Grid item>
                    <Detail title={t('components.profile.fields.telephone.title')} value={phone} />
                  </Grid>
                </Grid>
              }
            />

            <CardContent className={styles.content}>
              <Grid container spacing={2} direction="column">
                <Grid item>
                  <Detail title={t('components.profile.fields.bio.title')} value={bio} />
                </Grid>

                <Grid item>
                  <Typography color="primary" weight="boldLight">
                    {t('components.profile.fields.keywords.title')}
                  </Typography>
                  <TagsComponent tags={keywords} />
                </Grid>

                <Grid item>
                  <Typography color="primary" weight="boldLight">
                    {t('components.profile.fields.skills.title')}
                  </Typography>
                  <TagsComponent tags={skills} />
                </Grid>

                <Grid item container direction="column">
                  <Typography color="primary" weight="boldLight">
                    {t('components.profile.fields.links.title')}
                  </Typography>
                  {links?.map((l, i) => (
                    <Link key={i} href={l} target="_blank">
                      {l}
                    </Link>
                  ))}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <AssociatedOrganizationsView
            organizationNameIDs={userMetadata.organizationNameIDs}
            title={t('pages.user-profile.associated-organizations.title')}
            helpText={t('pages.user-profile.associated-organizations.help')}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} xl={6}>
        <Grid container>
          <Grid item xs={12}>
            <ContributionsView
              title={t('pages.user-profile.communities.title')}
              helpText={t('pages.user-profile.communities.help')}
              contributions={contributions}
            />
          </Grid>
          <Grid item xs={12}>
            <ContributionsView
              title={t('pages.user-profile.pending-applications.title')}
              helpText={t('pages.user-profile.pending-applications.help')}
              contributions={pendingApplications}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default UserProfileView;
