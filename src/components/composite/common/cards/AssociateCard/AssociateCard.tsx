import { Avatar, Box, createStyles, makeStyles } from '@material-ui/core';
import React, { FC } from 'react';
import Typography from '../../../../core/Typography';

interface AssociateCardProps {
  name: string;
  title: string;
  avatar?: string;
}

const useStyles = makeStyles(theme =>
  createStyles({
    assAvatar: {
      width: theme.spacing(9),
      height: theme.spacing(7),
    },
    assWrapper: {
      width: theme.spacing(9),
      height: theme.spacing(10),
    },
    assText: {
      fontSize: 10,
    },
  })
);

export const AssociateCard: FC<AssociateCardProps> = ({ name, title, avatar }) => {
  const styles = useStyles();
  return (
    <Box className={styles.assWrapper}>
      <Avatar variant="square" className={styles.assAvatar} src={avatar}>
        {name[0]}
      </Avatar>
      <Typography color="primary" weight="boldLight" className={styles.assText}>
        {name}
      </Typography>
      <Typography weight="boldLight" className={styles.assText}>
        {title}
      </Typography>
    </Box>
  );
};
export default AssociateCard;
