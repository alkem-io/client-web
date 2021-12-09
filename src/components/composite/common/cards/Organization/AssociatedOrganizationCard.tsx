import { Avatar, Box, CardHeader, Skeleton, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import CircleTag from '../../../../core/CircleTag';
import LinkCard from '../../../../core/LinkCard/LinkCard';
import VerifiedStatus from '../../VerifiedStatus/VerifiedStatus';

const LINES_TO_SHOW = 4;
export interface AssociatedOrganizationCardProps {
  name: string;
  avatar?: string;
  information?: string;
  role?: string;
  members: number;
  verified: boolean;
  loading: boolean;
  url: string;
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
    multiLineEllipsis: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      '-webkit-line-clamp': LINES_TO_SHOW,
      '-webkit-box-orient': 'vertical',
    },
  })
);

const AssociatedOrganizationCard: FC<AssociatedOrganizationCardProps> = ({
  name,
  avatar,
  information,
  role,
  members,
  verified,
  loading,
  url,
}) => {
  const styles = useStyles();

  return (
    <LinkCard
      to={url}
      aria-label="associated-organization-card"
      classes={{
        root: styles.card,
      }}
    >
      <CardHeader
        className={styles.cardHeader}
        classes={{
          action: styles.cardHeaderAction,
        }}
        title={
          loading ? (
            <Skeleton animation="wave" width="80%" style={{ marginBottom: 2 }} />
          ) : (
            <Typography variant="h5" color="primary" fontWeight={600}>
              {name}
            </Typography>
          )
        }
        subheader={
          <>
            <>
              {loading ? (
                <Skeleton animation="wave" width="80%" style={{ marginBottom: 2 }} />
              ) : (
                <Typography variant="body2" className={styles.multiLineEllipsis}>
                  {information}
                </Typography>
              )}
            </>
            <>
              {loading ? (
                <Skeleton animation="wave" width="80%" style={{ marginBottom: 2 }} />
              ) : (
                <Typography variant="body2" color="primary">
                  {role}
                </Typography>
              )}
            </>
          </>
        }
        avatar={
          loading ? (
            <Skeleton animation="wave" variant="rectangular" width={64} height={64} />
          ) : (
            <Avatar variant="rounded" src={avatar} style={{ width: '64px', height: '64px' }}>
              {name[0]}
            </Avatar>
          )
        }
        action={
          !loading && (
            <Box display="flex" flexDirection="column" justifyContent="space-between">
              <Box display="flex">
                <Typography sx={{ marginRight: 1 }}>Members</Typography>
                <CircleTag text={`${members}`} color="primary" size="small" />
              </Box>
              <VerifiedStatus verified={verified} />
            </Box>
          )
        }
      />
    </LinkCard>
  );
};
export default AssociatedOrganizationCard;
