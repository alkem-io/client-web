import React, { FC } from 'react';

import Card, { CardProps } from '../core/Card';
import Typography from '../core/Typography';
import CircleTag from '../core/CircleTag';

import { createStyles } from '../../hooks/useTheme';
import { Theme } from '../../context/ThemeProvider';
import activitiesMock from './tempMockActivities';

export interface ActivityCardItem {
  name: string;
  digit: number;
  // color: Pick<Palette, 'positive' | 'neutral' | 'primary' | 'neutralMedium'>;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}
interface ActivityCardProps extends CardProps {
  title: string;
  items: Array<ActivityCardItem>;
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

const ActivityCard: FC<ActivityCardProps> = ({ title = 'Activity Panel', items = activitiesMock, classes }) => {
  const styles = useCardStyles();

  return (
    <Card
      bodyProps={{
        classes: {
          padding: (theme: Theme, { xs, sm, md }) => {
            return xs || sm || md ? `${theme.shape.spacing(2)}px` : `0 ${theme.shape.spacing(4)}px 0 0`;
          },
          background: (theme: Theme) => theme.palette.background,
          ...classes,
        },
      }}
      primaryTextProps={{ text: title }}
    >
      {items.map(({ name, digit, color }, i) => (
        <div className={styles.item} key={i}>
          <Typography as={'p'}>{name}:</Typography>
          <CircleTag text={`${digit}`} color={color || 'neutral'} />
        </div>
      ))}
    </Card>
  );
};
export default ActivityCard;
