import React, { FC } from 'react';

import Card, { CardProps } from '../core/Card';
import Typography from '../core/Typography';
import CircleTag from '../core/CircleTag';

import { createStyles } from '../../hooks/useTheme';
import { Theme } from '../../context/ThemeProvider';
import activitiesMock from './tempMockActivities';
import StateActivityCardItem from './StateActivityCardItem';
import { Maybe, Lifecycle } from '../../types/graphql-schema';

export interface ActivityCardItem {
  name: string;
  digit: number;
  // color: Pick<Palette, 'positive' | 'neutral' | 'primary' | 'neutralMedium'>;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}
interface ActivityCardProps extends CardProps {
  title: string;
  items: Array<ActivityCardItem>;
  lifecycle?: Maybe<Lifecycle>;
}

const useCardStyles = createStyles(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.shape.spacing(2),
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    flexGrow: 1,
    alignItems: 'center',

    '& > p': {
      marginBottom: 0,
      textTransform: 'capitalize',
    },
  },
}));

const ActivityCard: FC<ActivityCardProps> = ({
  title = 'Activity Panel',
  items = activitiesMock,
  lifecycle = null,
  classes,
}) => {
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
        className: 'h-100',
      }}
      primaryTextProps={{ text: title }}
    >
      <div className={styles.wrapper}>
        {items.map(({ name, digit, color }, i) => (
          <div className={styles.item} key={i}>
            <Typography as={'p'}>{name}:</Typography>
            <CircleTag text={`${digit}`} color={color || 'neutral'} />
          </div>
        ))}
        <StateActivityCardItem lifecycle={lifecycle || undefined}></StateActivityCardItem>
      </div>
    </Card>
  );
};

export const Activities: FC<{ items: ActivityCardItem[] }> = ({ items }) => {
  const styles = useCardStyles();

  return (
    <div className={styles.wrapper}>
      {items.map(({ name, digit, color }, i) => (
        <div className={styles.item} key={i}>
          <Typography as={'p'}>{name}:</Typography>
          <CircleTag text={`${digit}`} color={color || 'neutral'} />
        </div>
      ))}
    </div>
  );
};

export default ActivityCard;
