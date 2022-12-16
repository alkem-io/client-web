import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AboutSection } from '../../common/tabs/About/AboutSection';
import { JourneyAboutWithHost } from '../../common/tabs/About/Types';
import { MetricItem } from '../../../../common/components/composite/common/MetricsPanel/Metrics';
import { MetricType } from '../../../platform/metrics/MetricType';
import getMetricCount from '../../../platform/metrics/utils/getMetricCount';
import { useHub } from '../HubContext/useHub';

interface HubAboutViewProps extends JourneyAboutWithHost {}

export const HubAboutView: FC<HubAboutViewProps> = ({ hostOrganization, metrics, ...rest }) => {
  const { t } = useTranslation();
  const { hubNameId, communityId } = useHub();

  const leadOrganizations = useMemo(() => (hostOrganization ? [hostOrganization] : undefined), [hostOrganization]);

  const metricsItems: MetricItem[] = useMemo(() => {
    return [
      {
        name: t('common.challenges'),
        type: MetricType.Challenge,
        count: getMetricCount(metrics, MetricType.Challenge),
        color: 'neutral',
      },
      {
        name: t('common.opportunities'),
        count: getMetricCount(metrics, MetricType.Opportunity),
        color: 'primary',
      },
      {
        name: t('common.members'),
        count: getMetricCount(metrics, MetricType.Member),
        color: 'neutralMedium',
      },
    ];
  }, [metrics, t]);

  return (
    <AboutSection
      journeyTypeName="hub"
      leadOrganizations={leadOrganizations}
      hubNameId={hubNameId}
      communityId={communityId}
      metricsItems={metricsItems}
      {...rest}
    />
  );
};
