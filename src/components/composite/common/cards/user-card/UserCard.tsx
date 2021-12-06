import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, SvgIcon, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import TagsComponent from '../../TagsComponent/TagsComponent';

// todo: unify card height on a later stage
// Per requirements in {@link https://xd.adobe.com/view/8ecaacf7-2a23-48f4-b954-b61e4b1e0e0f-db99/specs/}
export const USER_CARD_HEIGHT = 416;
const IMAGE_HEIGHT = 188;
const TAG_CONTAINER_HEIGHT = 82;
const TAG_DISPLAY_COUNT = 3;
const INITIAL_ELEVATION = 1;
const FINAL_ELEVATION = 8;

// css per design -> https://xd.adobe.com/view/8ecaacf7-2a23-48f4-b954-b61e4b1e0e0f-db99/specs/
const useStyles = makeStyles(theme => ({
  avatar: {
    height: IMAGE_HEIGHT,
    width: IMAGE_HEIGHT,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    height: IMAGE_HEIGHT,
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
  infoRowHeight: {
    height: (theme.typography.body1.fontSize as number) * (theme.typography.body1.lineHeight as number),
  },
  infoRowIconMargin: {
    marginRight: theme.spacing(0.5),
  },
}));

/* todo add jobTitle */
export interface UserCardProps {
  avatarSrc: string;
  displayName: string;
  tags: string[];
  url: string;
  roleName?: string;
  city?: string;
  country?: string;
}

const UserCard: FC<UserCardProps> = ({ avatarSrc, displayName, city, country, tags, url, roleName }) => {
  const styles = useStyles();
  const location = [city, country].filter(x => !!x).join(', ');
  const [elevation, setElevation] = useState(INITIAL_ELEVATION);
  return (
    <Link component={RouterLink} to={url} underline="none" aria-label="user-card">
      <Card
        elevation={elevation}
        onMouseOver={() => setElevation(FINAL_ELEVATION)}
        onMouseOut={() => setElevation(INITIAL_ELEVATION)}
      >
        <Box padding={0.8} paddingBottom={1.5}>
          <div className={styles.imageContainer}>
            <Avatar
              className={styles.avatar}
              src={avatarSrc}
              aria-label="User avatar"
              alt={`${displayName}\`s avatar`}
              variant="rounded"
            >
              {displayName[0]}
            </Avatar>
          </div>
          <CardContent className={styles.cardContent}>
            <Grid container spacing={1}>
              <Grid item>
                <Typography color="textPrimary" variant={'h3'} noWrap={true}>
                  {displayName}
                </Typography>
              </Grid>
              <Grid container item>
                <InfoRow text={roleName} icon={PersonIcon} ariaLabel="Role name" />
                <InfoRow text={location} icon={LocationOnIcon} ariaLabel="Location" />
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
  ariaLabel: string;
  text?: string;
}

const InfoRow: FC<InfoRowProps> = ({ icon: Icon, text, ariaLabel }) => {
  const styles = useStyles();

  return (
    <Grid container alignItems={'center'} className={styles.infoRowHeight}>
      <Icon className={styles.infoRowHeight} />
      <Typography color="textPrimary" variant="body1" noWrap={true} aria-label={ariaLabel}>
        {text}
      </Typography>
    </Grid>
  );
};
