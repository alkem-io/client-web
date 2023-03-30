import React, { FC, useMemo } from 'react';
import { AboutSection } from '../../common/tabs/About/AboutSection';
import { JourneyAboutWithHost } from '../../common/tabs/About/Types';
import { useHub } from '../HubContext/useHub';
import useMetricsItems from '../../../platform/metrics/utils/useMetricsItems';
import HubMetrics from '../Metrics/HubMetrics';

interface HubAboutViewProps extends JourneyAboutWithHost {}

// TODO Consider using AboutSection in the Page directly
export const HubAboutView: FC<HubAboutViewProps> = ({ hostOrganization, metrics, ...rest }) => {
  const { hubNameId, communityId } = useHub();

  const leadOrganizations = useMemo(() => (hostOrganization ? [hostOrganization] : undefined), [hostOrganization]);

  const metricsItems = useMetricsItems(metrics, HubMetrics);

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
