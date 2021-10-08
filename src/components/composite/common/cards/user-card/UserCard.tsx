import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Link from '@material-ui/core/Link';
import { SvgIcon, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PersonIcon from '@material-ui/icons/Person';
import TagsComponent from '../../TagsComponent/TagsComponent';
import Image from '../../../../core/Image';
import Box from '@material-ui/core/Box';
import { Agent } from '../../../../../models/graphql-schema';
import useUserRoleNameForCard from '../../../../../hooks/cards/useUserRoleNameForCard';

// todo: unify card height on a later stage
// Per requirements in {@link https://xd.adobe.com/view/8ecaacf7-2a23-48f4-b954-b61e4b1e0e0f-db99/specs/}
export const USER_CARD_HEIGHT = 416;
const IMAGE_HEIGHT = 188;
const TAG_CONTAINER_HEIGHT = 82;
const TAG_DISPLAY_COUNT = 3;

// css per design -> https://xd.adobe.com/view/8ecaacf7-2a23-48f4-b954-b61e4b1e0e0f-db99/specs/
const useStyles = makeStyles(theme => ({
  iconMargin: {
    marginRight: theme.spacing(0.5),
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: IMAGE_HEIGHT,

    '& > img': {
      borderRadius: theme.shape.borderRadius,
    },
  },
  cardContent: {
    padding: 0,
    paddingTop: theme.spacing(1),

    '&:last-child': {
      paddingBottom: 0,
    },
  },
  tagBoxSize: {
    height: TAG_CONTAINER_HEIGHT,
  },
}));

export interface UserCardProps {
  avatarSrc: string;
  displayName: string;
  tags: string[];
  url: string;
  userAgent: Agent;
  resourceId: string;
  city?: string;
  country?: string;
}

const UserCard: FC<UserCardProps> = ({ avatarSrc, displayName, city, country, tags, url, userAgent, resourceId }) => {
  const styles = useStyles();
  const roleName = useUserRoleNameForCard(userAgent, resourceId);

  return (
    <Link component={RouterLink} to={url} underline="none">
      <Card>
        <Box padding={0.8} paddingBottom={1.5}>
          <div className={styles.imageContainer}>
            <Image src={avatarSrc} aria-label="User avatar" alt={`${displayName}\`s avatar`} />
          </div>
          <CardContent className={styles.cardContent}>
            <Grid container spacing={1}>
              <Grid item>
                <Typography color="textPrimary" variant={'h3'} noWrap={true}>
                  {displayName}
                </Typography>
              </Grid>
              <Grid container item>
                <InfoRow text={roleName} icon={PersonIcon} />
                <InfoRow text={`${city}${city && country && ', '}${country}`} icon={LocationOnIcon} />
              </Grid>
              <Grid item>
                <TagsComponent tags={tags} count={TAG_DISPLAY_COUNT} className={styles.tagBoxSize} />
              </Grid>
            </Grid>
          </CardContent>
        </Box>
      </Card>
    </Link>
  );
};
export default UserCard;

interface InfoRowProps {
  icon: typeof SvgIcon;
  text?: string;
}

const InfoRow: FC<InfoRowProps> = ({ icon: Icon, text }) => {
  const styles = useStyles();

  return (
    <Grid container item alignItems={'center'}>
      <Icon fontSize="inherit" className={styles.iconMargin} />
      <Typography color="textPrimary" noWrap={true}>
        {text}
      </Typography>
    </Grid>
  );
};
