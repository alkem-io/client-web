import getMetricCount from '../../../../platform/metrics/utils/getMetricCount';
import {
  AssociatedOrganizationDetailsFragment,
  OrganizationVerificationEnum,
} from '../../../../../core/apollo/generated/graphql-schema';
import { buildOrganizationUrl } from '../../../../../main/routing/urlBuilders';
import { ApolloError } from '@apollo/client';
import { MetricType } from '../../../../platform/metrics/MetricType';

export interface AssociatedOrganization {
  key: string; // to be used as React key
  name?: string;
  avatar?: string;
  description?: string;
  city?: string;
  country?: string;
  associatesCount: number;
  verified: boolean;
  url?: string;
  loading?: boolean;
  error?: ApolloError;
}

interface RequestState {
  error?: ApolloError;
  loading?: boolean;
}

export const mapToAssociatedOrganization = (
  organization: AssociatedOrganizationDetailsFragment | undefined,
  key: string,
  state?: RequestState
): AssociatedOrganization => {
  return {
    key,
    name: organization?.profile.displayName,
    associatesCount: getMetricCount(organization?.metrics || [], MetricType.Associate),
    description: organization?.profile.description,
    city: organization?.profile.location?.city,
    country: organization?.profile.location?.country,
    avatar: organization?.profile.avatar?.uri,
    verified: organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
    url: organization && buildOrganizationUrl(organization.nameID),
    ...state,
  };
};
