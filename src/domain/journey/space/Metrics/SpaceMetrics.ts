import { MetricType } from '../../../platform/metrics/MetricType';
import { MetricsItemSpec } from '../../../platform/metrics/utils/useMetricsItems';

const SpaceMetrics: MetricsItemSpec[] = [
  {
    label: 'common.subspaces',
    type: MetricType.Challenge,
    color: 'neutral',
  },
  {
    label: 'common.members',
    type: MetricType.Member,
    color: 'neutralMedium',
  },
];

export default SpaceMetrics;
