import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  createStyles,
  Grid,
  Link,
  makeStyles,
} from '@material-ui/core';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsButton } from '../../components/composite';
import SocialLinks, { SocialLinkItem } from '../../components/composite/common/SocialLinks/SocialLinks';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import VerifiedStatus from '../../components/composite/common/VerifiedStatus/VerifiedStatus';
import Typography from '../../components/core/Typography';

export interface OrganizationProfileViewProps {
  entity: {
    avatar?: string;
    banner?: string;
    displayName: string;
    settingsUrl: string;
    settingsTooltip: string;
    location?: string;
    telephone?: string;
    bio?: string;
    socialLinks?: SocialLinkItem[];
    tagsets: { name: string; tags: string[] }[];
    links: string[];
    varified?: boolean;
    website?: string;
  };
  permissions: {
    canEdit: boolean;
  };
}

const Detail: FC<{ title: string; value?: string }> = ({ title, value }) => {
  if (value === undefined) return null;
  return (
    <>
      <Typography color="primary" weight="boldLight">
        {title}
      </Typography>
      <Typography>{value}</Typography>
    </>
  );
};

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.neutralLight.main,
    },
    media: {
      // TODO Use theme palette colors (primary, pacific blue, positive)
      // background: `linear-gradient(90deg, ${theme.palette.primary.main} 1%, rgba(0,188,212,1) 43%, ${theme.palette.positive.main} 100%)`,
      background: 'linear-gradient(90deg, rgba(0,129,143,1) 1%, rgba(0,188,212,1) 43%, rgba(0,168,143,1) 100%)',
      height: theme.spacing(14),
    },
    content: {
      paddingTop: theme.spacing(7),
      paddingLeft: theme.spacing(7),
      paddingRight: theme.spacing(7),
    },
    avatar: {
      width: theme.spacing(16),
      height: theme.spacing(16),
    },
    header: {
      alignItems: 'flex-end',
      paddingTop: theme.spacing(3),
      paddingLeft: theme.spacing(7),
      paddingRight: theme.spacing(3),
    },
    headerTitle: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    headerAction: {
      alignSelf: 'flex-end',
    },
  })
);
export const OrganizationProfileView: FC<OrganizationProfileViewProps> = ({ entity, permissions }) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { website } = entity;
  return (
    <Card elevation={0} className={styles.card} square>
      <CardMedia className={styles.media} image={entity.banner}>
        <CardHeader
          classes={{
            action: styles.headerAction,
            title: styles.headerTitle,
          }}
          avatar={
            <Avatar variant="square" src={entity.avatar} className={styles.avatar}>
              {entity.displayName[0]}
            </Avatar>
          }
          className={styles.header}
          action={
            permissions.canEdit && (
              <SettingsButton color={'primary'} to={entity.settingsUrl} tooltip={entity.settingsTooltip} />
            )
          }
          title={
            <Box padding={1}>{entity.varified !== undefined && <VerifiedStatus verified={entity.varified} />}</Box>
          }
        />
      </CardMedia>

      <CardContent className={styles.content}>
        <Grid container spacing={2} direction="column">
          <Grid item container>
            <Grid item xs={12}>
              <Typography variant="h1" weight="bold">
                {entity.displayName}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Detail title={t('components.profile.fields.location.title')} value={entity.location} />
          </Grid>
          <Grid item container spacing={2} alignItems="flex-start">
            <Grid item xs={6}>
              <SocialLinks title="Contact" items={entity.socialLinks} />
            </Grid>
            <Grid item xs={6}>
              <Detail title={t('components.profile.fields.telephone.title')} value={entity.telephone} />
            </Grid>
          </Grid>
          {website && (
            <Grid item>
              <Typography color="primary" weight="boldLight">
                {t('components.profile.fields.website.title')}
              </Typography>
              <Link href={website}>{website} </Link>
            </Grid>
          )}
          <Grid item>
            <Detail title={t('components.profile.fields.bio.title')} value={entity.bio} />
          </Grid>
          {entity.tagsets
            ?.filter(t => t.tags.length > 0)
            .map((tagset, i) => (
              <Grid item key={i}>
                <Typography color="primary" weight="boldLight">
                  {tagset.name}
                </Typography>
                <TagsComponent tags={tagset.tags} count={5} />
              </Grid>
            ))}

          <Grid item container direction="column">
            <Typography color="primary" weight="boldLight">
              {t('components.profile.fields.links.title')}
            </Typography>
            {entity.links?.map((l, i) => (
              <Link key={i} href={l}>
                {l}
              </Link>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default OrganizationProfileView;
