import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  createStyles,
  Grid,
  Link,
  makeStyles,
  Tooltip,
} from '@material-ui/core';
import { Help } from '@material-ui/icons';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsButton } from '../../components/composite';
import SocialLinks from '../../components/composite/common/SocialLinks/SocialLinks';
import TagsComponent from '../../components/composite/common/TagsComponent/TagsComponent';
import VerifiedStatus from '../../components/composite/common/VerifiedStatus/VerifiedStatus';
import Typography from '../../components/core/Typography';
import {
  OrganizationContainerEntities,
  OrganizationContainerState,
} from '../../containers/organization/OrganizationPageContainer';
import { OrganizationVerificationEnum } from '../../models/graphql-schema';
import { buildAdminOrganizationUrl } from '../../utils/urlBuilders';

interface OrganizationPageViewProps {
  entities: OrganizationContainerEntities;
  state: OrganizationContainerState;
}

const Detail: FC<{ title: string; value?: string }> = ({ title, value }) => {
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
      background: theme.palette.neutralMedium.main,
      height: 140,
    },
    content: {
      paddingTop: theme.spacing(6),
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(6),
    },
    avatar: {
      width: theme.spacing(13),
      height: theme.spacing(13),
    },
    assAvatar: {
      width: theme.spacing(9),
      height: theme.spacing(7),
    },
    assWrapper: {
      width: theme.spacing(9),
      height: theme.spacing(10),
    },
    assText: {
      fontSize: 10,
    },
    contCard: {
      width: theme.spacing(26),
    },
    contCardContent: {
      padding: theme.spacing(1),
    },
    contMedia: {
      background: theme.palette.neutralMedium.main,
      height: theme.spacing(8),
    },
    header: {
      alignItems: 'flex-end',
      paddingTop: theme.spacing(6),
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(6),
    },
    headerTitle: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    headerAction: {
      alignSelf: 'flex-end',
    },
    entityType: {
      fontSize: 12,
    },
    entityTypeWrapper: {
      background: '#B8BAC8 0% 0% no-repeat padding-box',
      boxShadow: '0px 3px 6px #00000029',
      borderRadius: '15px 0px 0px 15px',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      marginRight: theme.spacing(-1),
    },
  })
);
export const OrganizationPageView: FC<OrganizationPageViewProps> = ({ entities }) => {
  const styles = useStyles();

  const { t } = useTranslation();

  const { permissions, socialLinks, links, organization, skills, keywords } = entities;
  const { profile } = organization || {};

  const associates = [
    { name: 'Isabella Bookmaker', title: 'Owner', src: '' },
    { name: 'James Yellowflower', title: 'Owner', src: '' },
    { name: 'Masha Fence', title: 'Owner', src: '' },
    { name: 'Maddie Thinker', title: 'Owner', src: '' },
    { name: 'Josh Hipster', title: 'Owner', src: '' },
    { name: 'Nathalie Shadow', title: 'Owner', src: '' },
    { name: 'Jamie Blackwhite', title: 'Owner', src: '' },
    { name: 'Kevin Toghguy', title: 'Owner', src: '' },
    { name: 'Brandon Furrow', title: 'Owner', src: '' },
    { name: 'Natash Orange', title: 'Owner', src: '' },
    { name: 'Bella Leaner', title: 'Owner', src: '' },
    { name: 'Claire Influencer', title: 'Owner', src: '' },
    { name: 'Mason Thinkhard', title: 'Owner', src: '' },
    { name: 'Bram Airborne', title: 'Owner', src: '' },
    { name: 'Leigh-Anne Earrings', title: 'Owner', src: '' },
  ];

  const contributions = [
    { name: 'PET-Technologie', type: 'challenge', tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'], img: '' },
    { name: 'Care for data', type: 'opportunity', tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'], img: '' },
    { name: 'Care for data', type: 'challenge', tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'], img: '' },
    {
      name: 'PET-Technologie',
      type: 'opportunity',
      tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'],
      img: '',
    },
    { name: 'PET-Technologie', type: 'challenge', tags: ['Innovation', '3D', 'AI', 'Python', 'CSS', 'HTML'], img: '' },
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={7}>
        <Card elevation={0} className={styles.card}>
          <CardMedia className={styles.media}>
            <CardHeader
              classes={{
                action: styles.headerAction,
                title: styles.headerTitle,
              }}
              avatar={
                <Avatar variant="square" src={organization?.profile.avatar} className={styles.avatar}>
                  {organization?.displayName[0]}
                </Avatar>
              }
              className={styles.header}
              action={
                permissions.canEdit && (
                  <SettingsButton
                    color={'primary'}
                    to={buildAdminOrganizationUrl(organization?.nameID || '')}
                    tooltip={t('pages.organization.settings.tooltip')}
                  />
                )
              }
              title={
                <Box padding={1}>
                  <VerifiedStatus
                    verified={
                      organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation
                    }
                  />
                </Box>
              }
            ></CardHeader>
          </CardMedia>

          <CardContent className={styles.content}>
            <Grid container spacing={2} direction="column">
              <Grid item container>
                <Grid item xs={12}>
                  <Typography variant="h1" weight="bold">
                    {organization?.displayName}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item>
                <Detail title={t('components.profile.fields.location.title')} value="N/A" />
              </Grid>
              <Grid item container spacing={2} alignItems="flex-start">
                <Grid item xs={6}>
                  <SocialLinks title="Contact" items={socialLinks} />
                </Grid>
                <Grid item xs={6}>
                  <Detail title={t('components.profile.fields.telephone.title')} value="N/A" />
                </Grid>
              </Grid>
              <Grid item>
                <Detail title={t('components.profile.fields.bio.title')} value={profile?.description} />
              </Grid>
              <Grid item>
                <Typography color="primary" weight="boldLight">
                  {t('components.profile.fields.keywords.title')}
                </Typography>
                <TagsComponent tags={keywords} count={5} />
              </Grid>
              <Grid item>
                <Typography color="primary" weight="boldLight">
                  {t('components.profile.fields.capabilities.title')}
                </Typography>
                <TagsComponent tags={skills} count={5} />
              </Grid>
              <Grid item container direction="column">
                <Typography color="primary" weight="boldLight">
                  {t('components.profile.fields.links.title')}
                </Typography>
                {links.map((l, i) => (
                  <Link key={i} href={l}>
                    {l}
                  </Link>
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} lg={5}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card elevation={0} className={styles.card}>
              <CardHeader
                title={
                  <>
                    <Typography variant="h3" weight="boldLight">
                      Associates ({associates.length})
                      <Tooltip title="Users associated with this organization" arrow placement="right">
                        <Help color="primary" />
                      </Tooltip>
                    </Typography>
                  </>
                }
              />
              <CardContent>
                <Grid item container spacing={2}>
                  {associates.map((x, i) => (
                    <Grid key={i} item>
                      <Box className={styles.assWrapper}>
                        <Avatar variant="square" className={styles.assAvatar} src={x.src}>
                          {x.name[0]}
                        </Avatar>
                        <Typography color="primary" weight="boldLight" className={styles.assText}>
                          {x.name}
                        </Typography>
                        <Typography weight="boldLight" className={styles.assText}>
                          {x.title}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                  <Grid item container justifyContent="flex-end">
                    <Link>See more</Link>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card elevation={0} className={styles.card}>
              <CardHeader
                title={
                  <>
                    <Typography variant="h3" weight="boldLight">
                      Contributions
                      <Tooltip
                        title="Shows different challenges and opportunities you are contributing to."
                        arrow
                        placement="right"
                      >
                        <Help color="primary" />
                      </Tooltip>
                    </Typography>
                  </>
                }
              ></CardHeader>
              <CardContent>
                <Grid container spacing={1}>
                  {contributions.map((x, i) => (
                    <Grid item key={i}>
                      <Card className={styles.contCard}>
                        <CardMedia src={x.img} className={styles.contMedia} />
                        <CardContent className={styles.contCardContent}>
                          <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                            <Grid item>
                              <Typography color="primary" weight="boldLight">
                                {x.name}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Box className={styles.entityTypeWrapper}>
                                <Typography variant="body1" className={styles.entityType}>
                                  {x.type}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item>
                              <TagsComponent tags={x.tags} count={2} />
                            </Grid>
                          </Grid>
                        </CardContent>
                        <CardActionArea></CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OrganizationPageView;
