import { Avatar, Box, createStyles, makeStyles, Tooltip } from '@material-ui/core';
import React, { FC } from 'react';
import Typography from '../../../../core/Typography';
import UserCard, { UserCardProps } from '../user-card/UserCard';

interface AssociateCardProps extends Omit<UserCardProps, 'url'> {}

const useStyles = makeStyles(theme =>
  createStyles({
    avatar: {
      width: theme.spacing(9),
      height: theme.spacing(7),
    },
    wrapper: {
      width: theme.spacing(9),
      height: theme.spacing(10),
    },
    text: {
      fontSize: 10,
    },
  })
);

export const AssociateCard: FC<AssociateCardProps> = props => {
  const styles = useStyles();
  const { displayName, roleName, avatarSrc } = props;

  return (
    <Box className={styles.wrapper}>
      <Tooltip arrow title={<UserCard {...props} url="" />}>
        <Avatar variant="square" className={styles.avatar} src={avatarSrc}>
          {displayName[0]}
        </Avatar>
      </Tooltip>
      <Typography color="primary" weight="boldLight" className={styles.text}>
        {displayName}
      </Typography>
      {/* TODO Put Icon infornt of the role */}
      <Typography weight="boldLight" className={styles.text}>
        {roleName}
      </Typography>
    </Box>
  );
};
export default AssociateCard;
