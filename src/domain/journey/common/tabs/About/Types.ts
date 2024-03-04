import {
  EntityDashboardContributors,
  EntityDashboardLeads,
} from '../../../../community/community/EntityDashboardContributorsSection/Types';
import { JourneyTypeName } from '../../../JourneyTypeName';
import { ApolloError } from '@apollo/client';
import {
  AssociatedOrganizationDetailsFragment,
  InnovationFlowDetailsFragment,
  MetricsItemFragment,
  ReferenceDetailsFragment,
} from '../../../../../core/apollo/generated/graphql-schema';
import { MetricItem } from '../../../../platform/metrics/views/Metrics';

export interface AboutSectionProps extends EntityDashboardContributors, EntityDashboardLeads {
  journeyTypeName: JourneyTypeName;
  name: string;
  tagline: string | undefined;
  tags: string[] | undefined;
  vision: string | undefined;
  background: string | undefined;
  impact: string | undefined;
  who: string | undefined;
  communityReadAccess: boolean;
  spaceNameId: string | undefined;
  communityId: string | undefined;
  references: ReferenceDetailsFragment[] | undefined;
  metricsItems: MetricItem[];
  innovationFlow: InnovationFlowDetailsFragment;
  loading?: boolean;
  error?: ApolloError;
}

export interface JourneyAboutWithLead extends Omit<AboutSectionProps, 'journeyTypeName' | 'metricsItems'> {
  metrics: MetricsItemFragment[] | undefined;
  hostOrganization: AssociatedOrganizationDetailsFragment | undefined;
}
