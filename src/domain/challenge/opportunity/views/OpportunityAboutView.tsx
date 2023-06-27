import React, { FC } from 'react';
import { AboutSection } from '../../common/tabs/About/AboutSection';
import { JourneyAboutWithLead } from '../../common/tabs/About/Types';
import useMetricsItems from '../../../platform/metrics/utils/useMetricsItems';
import OpportunityMetrics from '../utils/useOpportunityMetricsItems';

interface OpportunityAboutViewProps extends JourneyAboutWithLead {}

// TODO use AboutSection in the Page directly
export const OpportunityAboutView: FC<OpportunityAboutViewProps> = ({ metrics, ...rest }) => {
  const metricsItems = useMetricsItems(metrics, OpportunityMetrics);

  return <AboutSection journeyTypeName="opportunity" metricsItems={metricsItems} {...rest} />;
};
