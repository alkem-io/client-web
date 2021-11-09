import React, { FC, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Link from '@material-ui/core/Link';
import { SvgIcon, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Box from '@material-ui/core/Box';
import PersonIcon from '@material-ui/icons/Person';
import TagsComponent from '../../TagsComponent/TagsComponent';
import Image from '../../../../core/Image';

// todo: unify card height on a later stage
// Per requirements in {@link https://xd.adobe.com/view/8ecaacf7-2a23-48f4-b954-b61e4b1e0e0f-db99/specs/}
export const USER_CARD_HEIGHT = 416;
const IMAGE_HEIGHT = 188;
const TAG_CONTAINER_HEIGHT = 82;
const TAG_DISPLAY_COUNT = 3;

// css per design -> https://xd.adobe.com/view/8ecaacf7-2a23-48f4-b954-b61e4b1e0e0f-db99/specs/
const useStyles = makeStyles(theme => ({
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

const INITIAL_ELEVATION = 1;
const FINAL_ELEVATION = 8;

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
      <Icon fontSize="inherit" className={styles.infoRowHeight} />
      <Typography color="textPrimary" variant="body1" noWrap={true} aria-label={ariaLabel}>
        {text}
      </Typography>
    </Grid>
  );
};
