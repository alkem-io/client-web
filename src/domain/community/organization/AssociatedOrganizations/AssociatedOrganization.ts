import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { AssociatedOrganizationQuery, OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import { ApolloError } from '@apollo/client';
import { MetricType } from '@/domain/platform/metrics/MetricType';

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
  // TODO: Do not use types from graphql here
  organization: AssociatedOrganizationQuery['lookup']['organization'] | undefined,
  key: string,
  state?: RequestState
): AssociatedOrganization => {
  return {
    key,
    profile: {
      // spread the props here to remove the tagline which is rendered automatically in the card
      displayName: organization?.profile.displayName || '',
      avatar: organization?.profile.avatar || undefined,
      location: organization?.profile.location || undefined,
      tagsets: organization?.profile.tagsets || undefined,
      url: organization?.profile.url || '',
    },
    seamless: true,
    associatesCount: getMetricCount(organization?.metrics || [], MetricType.Associate),
    verified: organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
    url: organization?.profile.url,
    ...state,
  };
};
