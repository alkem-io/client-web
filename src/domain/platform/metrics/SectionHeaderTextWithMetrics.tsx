import { ReactNode } from 'react';
import { Box } from '@mui/material';
import MetricCircleView, { MetricCircleViewProps } from './MetricCircleView';

interface SectionHeaderTextWithMetricsProps extends MetricCircleViewProps {
  headerText: ReactNode;
  activity: ReactNode;
  loading?: boolean;
}

const SectionHeaderTextWithMetrics = ({ headerText, activity, loading }: SectionHeaderTextWithMetricsProps) => {
  return (
    <Box display="flex" gap={2} alignItems="center">
      {headerText}
      <MetricCircleView color="primary" loading={loading}>
        {activity}
      </MetricCircleView>
    </Box>
  );
};

export default SectionHeaderTextWithMetrics;
