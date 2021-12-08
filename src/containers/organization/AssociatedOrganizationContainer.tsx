import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { useUserCardRoleName, useUserContext } from '../../hooks';
import { useOrganizationInfoQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { OrganizationVerificationEnum, User } from '../../models/graphql-schema';
import { buildOrganizationUrl } from '../../utils/urlBuilders';

export interface OrganizationContainerEntities {
  name: string;
  avatar?: string;
  information?: string;
  role?: string;
  membersCount: number;
  verified: boolean;
  url: string;
}

export interface OrganizationContainerActions {}

export interface OrganizationContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface OrganizationDetailsContainerProps
  extends ContainerProps<OrganizationContainerEntities, OrganizationContainerActions, OrganizationContainerState> {
  entities: {
    organizationNameId: string;
  };
}

export const AssociatedOrganizationContainer: FC<OrganizationDetailsContainerProps> = ({ children, entities }) => {
  const { user } = useUserContext();

  const { organizationNameId } = entities;

  const { data, loading, error } = useOrganizationInfoQuery({
    variables: {
      organizationId: organizationNameId,
    },
    errorPolicy: 'all',
  });

  const usersWithRoles = useUserCardRoleName([user?.user] as User[], data?.organization.id || '');

  return (
    <>
      {children(
        {
          name: data?.organization.displayName || '',
          membersCount: data?.organization.members?.length || 0,
          information: data?.organization.profile.description,
          avatar: data?.organization.profile.avatar || '',
          verified: data?.organization.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation,
          role: usersWithRoles[0]?.roleName || '',
          url: buildOrganizationUrl(organizationNameId),
        },
        {
          loading,
          error,
        },
        {}
      )}
    </>
  );
};
export default AssociatedOrganizationContainer;
