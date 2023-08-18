import { MetricType } from '../../../platform/metrics/MetricType';
import { MetricsItemSpec } from '../../../platform/metrics/utils/useMetricsItems';

const OpportunityMetrics: MetricsItemSpec[] = [
  {
    label: 'common.members',
    type: MetricType.Member,
    color: 'neutralMedium',
  },
  {
    label: 'common.interests',
    type: MetricType.Relation,
    color: 'primary',
  },
];

export default OpportunityMetrics;
