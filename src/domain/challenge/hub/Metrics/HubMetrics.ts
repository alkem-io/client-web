import { MetricType } from '../../../platform/metrics/MetricType';
import { MetricsItemSpec } from '../../../platform/metrics/utils/useMetricsItems';

const HubMetrics: MetricsItemSpec[] = [
  {
    label: 'common.challenges',
    type: MetricType.Challenge,
    color: 'neutral',
  },
  {
    label: 'common.opportunities',
    type: MetricType.Opportunity,
    color: 'primary',
  },
  {
    label: 'common.members',
    type: MetricType.Member,
    color: 'neutralMedium',
  },
];

export default HubMetrics;
