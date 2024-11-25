import React, { FC, useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '@/core/container/container';
import {
  useOrganizationPreferencesQuery,
  useUpdatePreferenceOnOrganizationMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { OrganizationPreferenceType, Preference } from '@/core/apollo/generated/graphql-schema';

export interface OrganizationPreferenceContainerEntities {
  preferences: Preference[];
}

export interface OrganizationPreferenceContainerActions {
  onUpdate: (id: string, type: OrganizationPreferenceType, value: boolean) => void;
}

export interface OrganizationPreferenceContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface OrganizationPreferenceContainerProps
  extends ContainerChildProps<
    OrganizationPreferenceContainerEntities,
    OrganizationPreferenceContainerActions,
    OrganizationPreferenceContainerState
  > {
  orgId: string;
}

const OrganizationPreferenceContainer: FC<OrganizationPreferenceContainerProps> = ({ children, orgId }) => {
  const { data, loading, error } = useOrganizationPreferencesQuery({
    variables: { orgId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const [updatePreference] = useUpdatePreferenceOnOrganizationMutation({});

  const preferences = data?.organization?.preferences ?? [];

  const onUpdate = useCallback(
    (id: string, type: OrganizationPreferenceType, checked: boolean) => {
      updatePreference({
        variables: {
          preferenceData: {
            organizationID: orgId,
            type,
            value: checked ? 'true' : 'false',
          },
        },
        optimisticResponse: {
          updatePreferenceOnOrganization: {
            __typename: 'Preference',
            id,
            value: checked ? 'true' : 'false',
          },
        },
      });
    },
    [orgId, updatePreference]
  );

  return <>{children({ preferences }, { loading, error }, { onUpdate })}</>;
};

export default OrganizationPreferenceContainer;
