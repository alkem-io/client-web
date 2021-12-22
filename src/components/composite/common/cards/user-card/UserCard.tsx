import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, SvgIcon, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, useState } from 'react';
import TagsComponent from '../../TagsComponent/TagsComponent';
import Skeleton from '@mui/material/Skeleton';
import ConditionalLink from '../../../../core/ConditionalLink';

// todo: unify card height on a later stage
// Per requirements in {@link https://xd.adobe.com/view/8ecaacf7-2a23-48f4-b954-b61e4b1e0e0f-db99/specs/}
export const USER_CARD_HEIGHT = 416;
const TAG_CONTAINER_HEIGHT = 72;
const TAG_DISPLAY_COUNT = 3;
const INITIAL_ELEVATION = 1;
const FINAL_ELEVATION = 8;

// css per design -> https://xd.adobe.com/view/8ecaacf7-2a23-48f4-b954-b61e4b1e0e0f-db99/specs/
const useStyles = makeStyles(theme => ({
  avatar: {
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    aspectRatio: '1/1',
  },
  card: {
    minWidth: theme.spacing(32),
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
    display: 'flex',
    flexDirection: 'column-reverse',
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
  id?: string;
  avatarSrc?: string;
  displayName?: string;
  tags?: string[];
  url?: string;
  roleName?: string;
  city?: string;
  country?: string;
  loading?: boolean;
}

const UserCard: FC<UserCardProps> = ({
  avatarSrc,
  displayName = '',
  city,
  country,
  tags = [],
  url,
  roleName,
  loading,
}) => {
  const styles = useStyles();
  const location = [city, country].filter(x => !!x).join(', ');
  const [elevation, setElevation] = useState(INITIAL_ELEVATION);
  return (
    <ConditionalLink condition={!!url} to={url} aria-label="user-card">
      <Card
        elevation={elevation}
        onMouseOver={() => setElevation(FINAL_ELEVATION)}
        onMouseOut={() => setElevation(INITIAL_ELEVATION)}
        className={styles.card}
      >
        <Box padding={0.8} paddingBottom={1.5}>
          <div className={styles.imageContainer}>
            {loading ? (
              <Skeleton variant={'rectangular'}>
                <Avatar className={styles.avatar} />
              </Skeleton>
            ) : (
              <Avatar
                className={styles.avatar}
                src={avatarSrc}
                aria-label="User avatar"
                alt={`${displayName}\`s avatar`}
                variant="rounded"
              >
                {displayName[0]}
              </Avatar>
            )}
          </div>
          <CardContent className={styles.cardContent}>
            <Grid container spacing={1}>
              <Grid item xs zeroMinWidth>
                <Typography color="primary" variant={'h5'} noWrap fontWeight={600}>
                  {displayName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <InfoRow text={roleName || 'Member'} icon={PersonIcon} ariaLabel="Role name" loading={loading} />
                <InfoRow
                  text={location || 'No location specified'}
                  icon={LocationOnIcon}
                  ariaLabel="Location"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={12} display="flex">
                <TagsComponent
                  tags={tags}
                  count={TAG_DISPLAY_COUNT}
                  className={styles.tagBoxSize}
                  keepInRow
                  loading={loading}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Box>
      </Card>
    </ConditionalLink>
  );
};
export default UserCard;

interface InfoRowProps {
  icon: typeof SvgIcon;
  ariaLabel: string;
  text?: string;
  loading?: boolean;
}

const InfoRow: FC<InfoRowProps> = ({ icon: Icon, text, ariaLabel, loading }) => {
  const styles = useStyles();

  return (
    <Grid item xs={12} zeroMinWidth>
      <Box display="flex" alignItems="center">
        <Icon className={styles.infoRowHeight} fontSize="small" />
        <Typography color="textPrimary" variant="body1" noWrap aria-label={ariaLabel} display="flex" flexGrow={1}>
          {loading ? <Skeleton width="70%" /> : text}
        </Typography>
      </Box>
    </Grid>
  );
};
