import { MetricType } from '../../../platform/metrics/MetricType';
import { MetricsItemSpec } from '../../../platform/metrics/utils/useMetricsItems';

const ChallengeMetrics: MetricsItemSpec[] = [
  {
    label: 'common.subspaces',
    type: MetricType.Opportunity,
    color: 'neutral',
  },
  {
    label: 'common.members',
    type: MetricType.Member,
    color: 'neutralMedium',
  },
];

export default ChallengeMetrics;
