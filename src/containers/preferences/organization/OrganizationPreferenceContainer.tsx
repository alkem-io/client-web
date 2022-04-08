import React, { FC, useCallback } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerChildProps } from '../../../models/container';
import {
  useOrganizationPreferencesQuery,
  useUpdatePreferenceOnOrganizationMutation,
} from '../../../hooks/generated/graphql';
import { OrganizationPreferenceType, Preference } from '../../../models/graphql-schema';
import { useApolloErrorHandler } from '../../../hooks';

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
  const handleError = useApolloErrorHandler();
  const { data, loading, error } = useOrganizationPreferencesQuery({
    variables: { orgId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

  const [updatePreference] = useUpdatePreferenceOnOrganizationMutation({
    onError: handleError,
  });

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
    [orgId]
  );

  return <>{children({ preferences }, { loading, error }, { onUpdate })}</>;
};
export default OrganizationPreferenceContainer;
