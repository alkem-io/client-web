import { MetricType } from '@/domain/platform/metrics/MetricType';
import { MetricsItemSpec } from '@/domain/platform/metrics/utils/useMetricsItems';

const OpportunityMetrics: MetricsItemSpec[] = [
  {
    label: 'common.members',
    type: MetricType.Member,
    color: 'neutralMedium',
  },
];

export default OpportunityMetrics;
