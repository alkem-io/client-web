import getMetricCount from '../../../../platform/metrics/utils/getMetricCount';
import {
  AssociatedOrganizationDetailsFragment,
  OrganizationVerificationEnum,
  User,
} from '../../../../../core/apollo/generated/graphql-schema';
import { buildOrganizationUrl } from '../../../../../common/utils/urlBuilders';
import { TFunction } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { MetricType } from '../../../../platform/metrics/MetricType';

export interface AssociatedOrganization {
  nameID: string;
  name?: string;
  avatar?: string;
  description?: string;
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
  nameID: string,
  user: User | undefined,
  t: TFunction,
  state?: RequestState
): AssociatedOrganization => {
  return {
    nameID, // to be used as React key
    name: organization?.profile.displayName,
    associatesCount: getMetricCount(organization?.metrics || [], MetricType.Associate),
    description: organization?.profile.description,
    avatar: organization?.profile.visual?.uri,
    verified: organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
    url: organization && buildOrganizationUrl(organization.nameID),
    ...state,
  };
};
