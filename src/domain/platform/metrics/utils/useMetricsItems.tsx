import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MetricType } from '../MetricType';
import getMetricCount, { Metric } from './getMetricCount';

export interface MetricItem {
  name: ReactNode;
  type?: MetricType;
  isLoading?: boolean;
  count: number;
  color?: 'positive' | 'neutral' | 'primary' | 'neutralMedium';
}

export interface MetricsItemSpec {
  label: TranslationKey;
  type: MetricType;
  color?: MetricItem['color'];
}

const useMetricsItems = (metrics: Metric[] | undefined, specs: MetricsItemSpec[] | undefined) => {
  const { t } = useTranslation();

  const metricsItems = useMemo(
    () =>
      specs?.map(({ label, type, color }) => {
        return {
          type,
          color,
          name: t(label),
          count: getMetricCount(metrics, type),
        } as MetricItem;
      }) ?? [],
    [metrics, specs, t]
  );

  return metricsItems;
};

export default useMetricsItems;
