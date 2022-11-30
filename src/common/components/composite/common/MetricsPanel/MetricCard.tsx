import React, { FC } from 'react';
import { Lifecycle, Maybe } from '../../../../../core/apollo/generated/graphql-schema';
import Card, { CardProps } from '../../../core/Card';
import { Metrics, MetricItem } from './Metrics';
import StateActivityCardItem from './StateMetricCardItem';
import metricsMock from './tempMockMetrics';

interface ActivityCardProps extends CardProps {
  title: string;
  items: Array<MetricItem>;
  lifecycle?: Maybe<Lifecycle>;
}

const ActivityCard: FC<ActivityCardProps> = ({
  title = 'Activity Panel',
  items = metricsMock,
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
          background: theme => theme.palette.background.default,
          ...classes,
        },
        className: 'h-100',
      }}
      primaryTextProps={{ text: title }}
    >
      <Metrics items={items}>
        <StateActivityCardItem lifecycle={lifecycle || undefined} />
      </Metrics>
    </Card>
  );
};

export default ActivityCard;
