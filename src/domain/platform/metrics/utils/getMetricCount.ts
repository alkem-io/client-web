import { MetricType } from '../MetricType';

export interface Metric {
  name: string;
  value: string;
}

/***
 * Return a value by the Metric name
 * @param metrics
 * @param name
 */
const getMetricCount = (metrics: Metric[] | undefined, name: MetricType): number => {
  const metric = metrics?.find(x => x.name === name);

  return metric ? Number(metric.value) : 0;
};

export default getMetricCount;
