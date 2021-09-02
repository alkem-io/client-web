import { Grid } from '@material-ui/core';
import React, { FC } from 'react';
import { Lifecycle, Maybe } from '../../models/graphql-schema';
import Card, { CardProps } from '../core/Card';
import CircleTag from '../core/CircleTag';
import Typography from '../core/Typography';
import StateActivityCardItem from './StateActivityCardItem';
import activitiesMock from './tempMockActivities';

export interface ActivityCardItem {
  name: string;
  digit: number;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}
interface ActivityCardProps extends CardProps {
  title: string;
  items: Array<ActivityCardItem>;
  lifecycle?: Maybe<Lifecycle>;
}

// const useCardStyles = createStyles(theme => ({
//   wrapper: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: theme.spacing(2),
//   },
//   item: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     flexGrow: 1,
//     alignItems: 'center',

//     '& > p': {
//       marginBottom: 0,
//       textTransform: 'capitalize',
//     },
//   },
// }));

const ActivityCard: FC<ActivityCardProps> = ({
  title = 'Activity Panel',
  items = activitiesMock,
  lifecycle = null,
  classes = {},
}) => {
  return (
    <Card
      bodyProps={{
        classes: {
          padding: (theme, { xs, sm, md }) => {
            return xs || sm || md ? `${theme.spacing(2)}px` : `0 ${theme.spacing(4)}px 0 0`;
          },
          background: theme => theme.palette.background.paper,
          ...classes,
        },
        className: 'h-100',
      }}
      primaryTextProps={{ text: title }}
    >
      <Activities items={items}>
        <StateActivityCardItem lifecycle={lifecycle || undefined} />
      </Activities>
    </Card>
  );
};

export const Activities: FC<{ items: ActivityCardItem[] }> = ({ items, children }) => {
  return (
    <Grid container spacing={1}>
      {items.map(({ name, digit, color }, i) => (
        <Grid item container key={i} xs={12} justifyContent={'space-between'} alignItems={'center'}>
          <Grid item alignContent={'center'}>
            <Typography>{name}</Typography>
          </Grid>
          <Grid item>
            <CircleTag text={`${digit}`} color={color || 'neutral'} />
          </Grid>
        </Grid>
      ))}
      {children}
    </Grid>
  );
};

export default ActivityCard;
