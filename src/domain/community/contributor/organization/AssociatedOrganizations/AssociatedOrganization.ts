import getMetricCount from '../../../../platform/metrics/utils/getMetricCount';
import {
  AssociatedOrganizationDetailsFragment,
  OrganizationVerificationEnum,
} from '@/core/apollo/generated/graphql-schema';
import { buildOrganizationUrl } from '@/main/routing/urlBuilders';
import { ApolloError } from '@apollo/client';
import { MetricType } from '../../../../platform/metrics/MetricType';

export interface AssociatedOrganization {
  key: string; // to be used as React key
  profile:
    | {
        url: string;
        displayName: string;
        avatar?: {
          uri: string;
        };
        location?: {
          city?: string;
          country?: string;
        };
        tagsets?: { tags: string[] }[];
      }
    | undefined;
  seamless?: boolean;
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
    profile: organization?.profile,
    seamless: true,
    associatesCount: getMetricCount(organization?.metrics || [], MetricType.Associate),
    verified: organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
    url: organization && buildOrganizationUrl(organization.nameID),
    ...state,
  };
};
