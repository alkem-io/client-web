import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AboutSection } from '../../common/tabs/About/AboutSection';
import { MetricType } from '../../../platform/metrics/MetricType';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import { JourneyAboutWithLead } from '../../common/tabs/About/Types';

interface ChallengeAboutViewProps extends JourneyAboutWithLead {}

export const ChallengeAboutView: FC<ChallengeAboutViewProps> = ({ metrics, ...rest }) => {
  const { t } = useTranslation();

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.opportunities'),
        type: MetricType.Opportunity,
        count: getMetricCount(metrics, MetricType.Opportunity),
        color: 'neutral',
      },
      {
        name: t('common.members'),
        count: getMetricCount(metrics, MetricType.Member),
        color: 'neutralMedium',
      },
    ];
  }, [metrics, t]);

  return <AboutSection journeyTypeName="challenge" metricsItems={metricsItems} {...rest} />;
};
