import React, { FC } from 'react';
import { AboutSection } from '../../common/tabs/About/AboutSection';
import { JourneyAboutWithLead } from '../../common/tabs/About/Types';
import useMetricsItems from '../../../platform/metrics/utils/useMetricsItems';
import ChallengeMetrics from '../utils/useChallengeMetricsItems';

interface ChallengeAboutViewProps extends JourneyAboutWithLead {}

// TODO use AboutSection in the Page directly
export const ChallengeAboutView: FC<ChallengeAboutViewProps> = ({ metrics, ...rest }) => {
  const metricsItems = useMetricsItems(metrics, ChallengeMetrics);

  return <AboutSection journeyTypeName="challenge" metricsItems={metricsItems} {...rest} />;
};
