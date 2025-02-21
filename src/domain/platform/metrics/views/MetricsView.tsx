import CircleTag from '@/core/ui/tags/CircleTag';
import { Grid, Typography } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { FC, ReactNode, useMemo } from 'react';
import { MetricItem } from '../utils/useMetricsItems';

export interface MetricViewProps {
  activity: MetricItem[];
  loading: boolean;
}

const ActivityView: FC<MetricViewProps> = ({ activity, loading }) => {
  const [leftHalf, rightHalf] = useMemo(() => {
    const length = activity.length;
    const isLengthOdd = length % 2 !== 0;
    const leftHalfLength = Math.floor(length / 2) + Number(isLengthOdd);
    const leftHalf = activity.slice(0, leftHalfLength);
    const rightHalf = activity.slice(leftHalfLength);

    return [leftHalf, rightHalf];
  }, [activity]);

  if (!activity.length) {
    return <></>;
  }

  if (loading) {
    return (
      <Grid container spacing={2}>
        <Grid container item>
          <Skeleton variant={'rectangular'} width="100%" />
        </Grid>
        <Grid container item>
          <Skeleton variant={'rectangular'} width="100%" />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <MetricViewColumn metric={leftHalf} />
      <MetricViewColumn metric={rightHalf} />
    </Grid>
  );
};

export default ActivityView;

const MetricViewColumn = ({ metric }: { metric: MetricItem[] }) => {
  if (!metric.length) return null;

  return (
    <Grid container item xs={6} spacing={1}>
      {metric.map(({ name, count }, i) => (
        <Grid key={i} item xs={12}>
          <MetricViewItem text={name} count={count} />
        </Grid>
      ))}
    </Grid>
  );
};

const MetricViewItem = ({ text, count }: { text: ReactNode; count: number }) => (
  <Grid item container alignItems="center" justifyContent="space-between">
    <Grid item>
      <Typography>{text}</Typography>
    </Grid>
    <Grid item>
      <CircleTag count={count} />
    </Grid>
  </Grid>
);
