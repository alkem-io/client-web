import { Avatar, Box, Paper, Skeleton, Tooltip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, useMemo } from 'react';
import ConditionalLink from '../../../../core/ConditionalLink';
import UserCard from '../user-card/UserCard';
import withElevationOnHover from '../../../../../domain/shared/components/withElevationOnHover';

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

const ElevatedPaper = withElevationOnHover(Paper);

export const ContributorCard: FC<ContributorCardProps> = props => {
  const styles = useStyles();
  const { displayName, avatar, url, tooltip } = props;

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
      <ElevatedPaper>
        <Box className={styles.wrapper}>
          <TooltipElement>
            <Avatar variant="rounded" className={styles.avatar} src={avatar}>
              {displayName[0]}
            </Avatar>
          </TooltipElement>
        </Box>
      </ElevatedPaper>
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
