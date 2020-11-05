import React, { FC } from 'react';
import { Theme } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';
import Button from '../core/Button';
import Card from '../core/Card';
import CircleTag from '../core/CircleTag';
import Typography from '../core/Typography';

const useCardStyles = createStyles(theme => ({
  item: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: theme.shape.spacing(2),
  },
  description: {
    flexGrow: 1,
    display: 'flex',
    minWidth: 0,

    '& > span': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
  },
}));

export const ActivityCard: FC = () => {
  const styles = useCardStyles();

  return (
    <Card
      bodyProps={{
        classes: {
          background: (theme: Theme) => theme.palette.background,
        },
      }}
      primaryTextProps={{ text: 'opportunity activity' }}
    >
      <div className={styles.item}>
        <Typography>Projects:</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <CircleTag text={'118'} color="positive" />
      </div>
      <div className={styles.item}>
        <Typography>Members:</Typography>
        <div style={{ flexGrow: 1 }}></div>
        <CircleTag text={'6171'} color="neutralMedium" />
      </div>
    </Card>
  );
};
