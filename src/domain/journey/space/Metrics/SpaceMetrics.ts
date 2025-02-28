import { MetricType } from '@/domain/platform/metrics/MetricType';
import { MetricsItemSpec } from '@/domain/platform/metrics/utils/useMetricsItems';

const SpaceMetrics: MetricsItemSpec[] = [
  {
    label: 'common.members',
    type: MetricType.Member,
    color: 'neutralMedium',
  },
];

export default SpaceMetrics;
