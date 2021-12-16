import { Avatar, Box, Skeleton, Tooltip } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC } from 'react';
import UserCard, { UserCardProps } from '../user-card/UserCard';
import ConditionalLink from '../../../../core/ConditionalLink';

interface AssociateCardProps extends UserCardProps {}

const useStyles = makeStyles(_ =>
  createStyles({
    avatar: {
      height: '100%',
      width: '100%',
    },
    wrapper: {
      minHeight: 64,
      minWidth: 64,
    },
    text: {
      fontSize: 10,
    },
    tooltip: {
      background: 'transparent',
      width: _.spacing(32),
    },
    skeleton: {
      minHeight: 64,
      minWidth: 64,
    },
  })
);

export const AssociateCard: FC<AssociateCardProps> = props => {
  const styles = useStyles();
  const { displayName, avatarSrc, url } = props;
  // roleName - reintroduce the role name

  return (
    <ConditionalLink to={url} condition={Boolean(url)} aria-label="associate-card">
      <Box className={styles.wrapper}>
        <Tooltip arrow title={<UserCard {...props} url="" />} classes={{ tooltip: styles.tooltip }}>
          <Avatar variant="rounded" className={styles.avatar} src={avatarSrc}>
            {displayName[0]}
          </Avatar>
        </Tooltip>
      </Box>
    </ConditionalLink>
  );
};

export const AssociateCardSkeleton = () => {
  const styles = useStyles();
  return (
    <Box className={styles.wrapper}>
      <Avatar variant="rounded" className={styles.avatar}>
        <Skeleton variant="rectangular" className={styles.skeleton} />
      </Avatar>
    </Box>
  );
};

export default AssociateCard;
