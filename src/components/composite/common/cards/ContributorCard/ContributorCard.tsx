import { Avatar, Box, Paper, Skeleton, Tooltip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, useMemo, useState } from 'react';
import { FINAL_ELEVATION, INITIAL_ELEVATION } from '../../../../../models/constants';
import ConditionalLink from '../../../../core/ConditionalLink';
import UserCard from '../user-card/UserCard';

interface ContributorCardTooltip {
  tags: string[];
  roleName?: string;
  city?: string;
  country?: string;
}

export interface ContributorCardProps {
  avatar: string;
  displayName: string;
  tooltip?: ContributorCardTooltip;
  url: string;
}

const useStyles = makeStyles(_ =>
  createStyles({
    avatar: {
      height: '100%',
      width: '100%',
      '& > img': {
        objectFit: 'contain',
      },
    },
    wrapper: {
      minHeight: 64,
      minWidth: 64,
      aspectRatio: '1/1',
    },
    text: {
      fontSize: 10,
    },
    tooltip: {
      background: 'transparent',
    },
    skeleton: {
      minHeight: 64,
      minWidth: 64,
    },
  })
);

export const ContributorCard: FC<ContributorCardProps> = props => {
  const styles = useStyles();
  const { displayName, avatar, url, tooltip } = props;
  const [elevation, setElevation] = useState(INITIAL_ELEVATION);

  const TooltipElement = useMemo(
    () =>
      ({ children }) =>
        tooltip ? (
          <Tooltip
            arrow
            title={
              <UserCard
                displayName={displayName}
                avatarSrc={avatar}
                tags={tooltip?.tags || []}
                roleName={tooltip?.roleName}
                city={tooltip?.city}
                country={tooltip?.country}
                url=""
              />
            }
            classes={{ tooltip: styles.tooltip }}
          >
            {children}
          </Tooltip>
        ) : (
          <>{children}</>
        ),
    [displayName, avatar, tooltip]
  );

  return (
    <ConditionalLink to={url} condition={Boolean(url)} aria-label="associate-card">
      <Paper
        elevation={elevation}
        onMouseOver={() => setElevation(FINAL_ELEVATION)}
        onMouseOut={() => setElevation(INITIAL_ELEVATION)}
      >
        <Box className={styles.wrapper}>
          <TooltipElement>
            <Avatar variant="rounded" className={styles.avatar} src={avatar}>
              {displayName[0]}
            </Avatar>
          </TooltipElement>
        </Box>
      </Paper>
    </ConditionalLink>
  );
};

export const ContributorCardSkeleton = () => {
  const styles = useStyles();
  return (
    <Box className={styles.wrapper}>
      <Avatar variant="rounded" className={styles.avatar}>
        <Skeleton variant="rectangular" className={styles.skeleton} />
      </Avatar>
    </Box>
  );
};

export default ContributorCard;
