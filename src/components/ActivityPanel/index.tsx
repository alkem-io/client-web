import React, { FC } from 'react';

import Card from '../core/Card';
import Typography from '../core/Typography';
import CircleTag from '../core/CircleTag';

import { createStyles } from '../../hooks/useTheme';
import { Theme } from '../../context/ThemeProvider';
import activitiesMock from './tempMockActivities';

interface ActivityCardProps {
  title: string;
  items: Array<{
    name: string;
    digit: number;
    // color: Pick<Palette, 'positive' | 'neutral' | 'primary' | 'neutralMedium'>;
    color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
  }>;
}

const useCardStyles = createStyles(theme => ({
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: theme.shape.spacing(2),

    '& > p': {
      marginBottom: 0,
      textTransform: 'capitalize',
    },
  },
}));

const ActivityCard: FC<ActivityCardProps> = ({ title = 'Activity Panel', items = activitiesMock }) => {
  const styles = useCardStyles();

  return (
    <Card
      bodyProps={{
        padding: (theme: Theme, { xs, sm, md }) => {
          return xs || sm || md ? `${theme.shape.spacing(2)}px` : `0 ${theme.shape.spacing(4)}px 0 0`;
        },
        background: (theme: Theme) => theme.palette.background,
      }}
      primaryTextProps={{ text: title }}
    >
      {items.map(({ name, digit, color }) => {
        return (
          <div key={digit} className={styles.item}>
            <Typography as={'p'}>{name}:</Typography>
            <CircleTag text={`${digit}`} color={color || 'neutral'} />
          </div>
        );
      })}
    </Card>
  );
};
export default ActivityCard;
