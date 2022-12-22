import React, { FC, useMemo } from 'react';
import { AboutSection } from '../../common/tabs/About/AboutSection';
import { MetricType } from '../../../platform/metrics/MetricType';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import { useTranslation } from 'react-i18next';
import { useOpportunity } from '../hooks/useOpportunity';
import { JourneyAboutWithLead } from '../../common/tabs/About/Types';

interface OpportunityAboutViewProps extends JourneyAboutWithLead {}

export const OpportunityAboutView: FC<OpportunityAboutViewProps> = ({ metrics, ...rest }) => {
  const { t } = useTranslation();
  const { hubNameId, communityId } = useOpportunity();

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.members'),
        type: MetricType.Member,
        count: getMetricCount(metrics, MetricType.Member),
        color: 'neutralMedium',
      },
      {
        name: t('common.interests'),
        count: getMetricCount(metrics, MetricType.Relation),
        color: 'primary',
      },
    ];
  }, [metrics, t]);

  return (
    <AboutSection
      journeyTypeName="opportunity"
      hubNameId={hubNameId}
      communityId={communityId}
      metricsItems={metricsItems}
      {...rest}
    />
  );
};
