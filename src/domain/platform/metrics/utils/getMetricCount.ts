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
const getMetricCount = <DefaultValue = undefined>(
  metrics: Metric[] | undefined,
  name: MetricType,
  defaultValue?: DefaultValue
): number | DefaultValue => {
  const metric = metrics?.find(x => x.name === name);

  return metric ? Number(metric.value) : (defaultValue as DefaultValue);
};

export default getMetricCount;
