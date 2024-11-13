import getMetricCount, { Metric } from './getMetricCount';
import { useTranslation } from 'react-i18next';
import { ReactNode, useMemo } from 'react';
import { MetricType } from '../MetricType';
import TranslationKey from '@core/i18n/utils/TranslationKey';

export interface MetricItem {
  name: ReactNode;
  type?: MetricType;
  isLoading?: boolean;
  count: number | undefined;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}

export interface MetricsItemSpec {
  label: TranslationKey;
  type: MetricType;
  color?: MetricItem['color'];
}

const useMetricsItems = (metrics: Metric[] | undefined, specs: MetricsItemSpec[] | undefined) => {
  const { t } = useTranslation();

  const metricsItems: MetricItem[] = useMemo(() => {
    return (
      specs?.map(({ label, type, color }) => {
        return {
          type,
          color,
          name: t(label),
          count: getMetricCount(metrics, type),
        };
      }) ?? []
    );
  }, [metrics, specs, t]);

  return metricsItems;
};

export default useMetricsItems;
