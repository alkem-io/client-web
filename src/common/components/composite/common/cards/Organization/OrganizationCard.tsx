import { Avatar, Box, CardHeader, Skeleton, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import OneLineMarkdown from '../../../../../../core/ui/markdown/OneLineMarkdown';
import CircleTag from '../../../../core/CircleTag';
import LinkCard from '../../../../core/LinkCard/LinkCard';
import VerifiedStatus from '../../VerifiedStatus/VerifiedStatus';

export interface OrganizationCardProps {
  name?: string;
  avatar?: string;
  description?: string;
  role?: string;
  associatesCount?: number;
  verified?: boolean;
  loading?: boolean;
  url?: string;
  transparent?: boolean;
}

const useStyles = makeStyles(theme =>
  createStyles({
    card: {
      background: theme.palette.background.default,
    },
    cardHeader: {
      padding: theme.spacing(1),
      alignItems: 'flex-start',
    },
    cardHeaderAction: {
      margin: 0,
      paddingRight: theme.spacing(3),
    },
  })
);

const OrganizationCard: FC<OrganizationCardProps> = ({
  name,
  avatar,
  description = '',
  role,
  associatesCount,
  verified,
  loading,
  url,
  transparent = false,
}) => {
  const styles = useStyles();

  return (
    <LinkCard
      to={url}
      aria-label="associated-organization-card"
      classes={{
        root: transparent ? undefined : styles.card,
      }}
      elevationDisabled={transparent}
    >
      <CardHeader
        className={styles.cardHeader}
        classes={{
          action: styles.cardHeaderAction,
        }}
        title={
          <Typography variant="h5" color="primary" fontWeight={600}>
            {loading ? <Skeleton width="80%" /> : name}
          </Typography>
        }
        subheader={
          <>
            {loading ? <Skeleton width="80%" /> : <OneLineMarkdown>{description}</OneLineMarkdown>}
            <Typography variant="body2" color="primary">
              {loading ? <Skeleton width="30%" /> : role}
            </Typography>
          </>
        }
        avatar={
          loading ? (
            <Skeleton variant="rectangular">
              <Avatar variant="rounded" src={avatar} sx={{ width: '64px', height: '64px' }} />
            </Skeleton>
          ) : (
            <Avatar variant="rounded" src={avatar} sx={{ width: '64px', height: '64px' }}>
              {name && name[0]}
            </Avatar>
          )
        }
        action={
          <Box display="flex" flexDirection="column" justifyContent="space-between">
            <Box display="flex">
              <Typography sx={{ marginRight: 1, flexGrow: 1 }}>{loading ? <Skeleton /> : 'Associates'}</Typography>
              {loading ? (
                <Skeleton variant="circular">
                  <CircleTag text={`${associatesCount}`} color="primary" size="small" />
                </Skeleton>
              ) : (
                <CircleTag text={`${associatesCount}`} color="primary" size="small" />
              )}
            </Box>
            {loading ? (
              <Skeleton>
                <VerifiedStatus verified={Boolean(verified)} />
              </Skeleton>
            ) : (
              <VerifiedStatus verified={Boolean(verified)} />
            )}
          </Box>
        }
      />
    </LinkCard>
  );
};

export default OrganizationCard;
