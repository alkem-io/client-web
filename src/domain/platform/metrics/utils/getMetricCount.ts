import { MetricType } from '../MetricType';

export interface Metric {
  name: string;
  value: string;
}

type MetricTypeName = MetricType[keyof MetricType];

/***
 * Return a value by activity's name
 * @param metrics
 * @param name
 */
const getMetricCount = (metrics: Metric[] | undefined, name: MetricTypeName): number => {
  const metric = metrics?.find(x => x.name === name);

  return metric ? Number(metric.value) : 0;
};

export default getMetricCount;
