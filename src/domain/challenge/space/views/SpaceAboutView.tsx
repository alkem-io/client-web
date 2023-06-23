import React, { FC, useMemo } from 'react';
import { AboutSection } from '../../common/tabs/About/AboutSection';
import { JourneyAboutWithHost } from '../../common/tabs/About/Types';
import { useSpace } from '../SpaceContext/useSpace';
import useMetricsItems from '../../../platform/metrics/utils/useMetricsItems';
import SpaceMetrics from '../Metrics/SpaceMetrics';

interface SpaceAboutViewProps extends JourneyAboutWithHost {}

// TODO Consider using AboutSection in the Page directly
export const SpaceAboutView: FC<SpaceAboutViewProps> = ({ hostOrganization, metrics, ...rest }) => {
  const { spaceNameId, communityId } = useSpace();

  const leadOrganizations = useMemo(() => (hostOrganization ? [hostOrganization] : undefined), [hostOrganization]);

  const metricsItems = useMetricsItems(metrics, SpaceMetrics);

  return (
    <AboutSection
      journeyTypeName="space"
      leadOrganizations={leadOrganizations}
      spaceNameId={spaceNameId}
      communityId={communityId}
      metricsItems={metricsItems}
      {...rest}
    />
  );
};
