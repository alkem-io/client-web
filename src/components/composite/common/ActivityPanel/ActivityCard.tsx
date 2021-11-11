import React, { FC } from 'react';
import { Lifecycle, Maybe } from '../../../../models/graphql-schema';
import Card, { CardProps } from '../../../core/Card';
import { Activities, ActivityItem } from './Activities';
import StateActivityCardItem from './StateActivityCardItem';
import activitiesMock from './tempMockActivities';

interface ActivityCardProps extends CardProps {
  title: string;
  items: Array<ActivityItem>;
  lifecycle?: Maybe<Lifecycle>;
}

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
            return xs || sm || md ? theme.spacing(2) : `0 ${theme.spacing(4)} 0 0`;
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

export default ActivityCard;
