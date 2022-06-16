import { getUserCardRoleNameKey } from '../../../hooks';
import getActivityCount from '../../../utils/get-activity-count';
import {
  AssociatedOrganizationDetailsFragment,
  OrganizationVerificationEnum,
  User,
} from '../../../models/graphql-schema';
import { buildOrganizationUrl } from '../../../utils/urlBuilders';
import { TFunction } from 'react-i18next';
import { ApolloError } from '@apollo/client';

export interface AssociatedOrganization {
  nameID: string;
  name?: string;
  avatar?: string;
  description?: string;
  role?: string;
  membersCount: number;
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
  const userRole = user && organization && getUserCardRoleNameKey(user, organization.id);

  return {
    nameID, // to be used as React key
    name: organization?.displayName,
    membersCount: getActivityCount(organization?.activity || [], 'members') || 0,
    description: organization?.profile.description,
    avatar: organization?.profile.avatar?.uri,
    verified: organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
    role: userRole && t(userRole),
    url: organization && buildOrganizationUrl(organization.nameID),
    ...state,
  };
};
