import { sortBy } from 'lodash';
import { useMemo } from 'react';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import {
  useUpdatePreferenceOnUserMutation,
  useUserNotificationsPreferencesQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '@/core/container/container';
import { Preference, PreferenceType } from '@/core/apollo/generated/graphql-schema';

export interface UserNotificationsContainerEntities {
  preferences: Preference[];
}

export interface UserNotificationsContainerState {
  loading: boolean;
}

export interface UserNotificationsContainerActions {
  updatePreference: (type: PreferenceType, checked: boolean, id: string) => void;
}

export interface UserNotificationsContainerProps
  extends ContainerChildProps<
    UserNotificationsContainerEntities,
    UserNotificationsContainerActions,
    UserNotificationsContainerState
  > {}

const UserNotificationsContainer = ({ children }: UserNotificationsContainerProps) => {
  const { userId, loading: urlResolverLoading } = useUrlResolver();
  const { data, loading } = useUserNotificationsPreferencesQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  const [updatePreferenceOnUser] = useUpdatePreferenceOnUserMutation();
  const updatePreference = (type: PreferenceType, checked: boolean, id: string) => {
    if (!userId) {
      return;
    }

    updatePreferenceOnUser({
      variables: {
        userId,
        type: type,
        value: checked ? 'true' : 'false',
      },
      optimisticResponse: {
        updatePreferenceOnUser: {
          id: id,
          __typename: 'Preference',
          value: checked ? 'true' : 'false',
        },
      },
    });
  };

  const preferences = useMemo(
    () => sortBy(data?.lookup.user?.preferences ?? [], x => x.definition.displayName),
    [data]
  );

  return (
    <>
      {children(
        {
          preferences,
        },
        { loading: loading || urlResolverLoading },
        { updatePreference }
      )}
    </>
  );
};

export default UserNotificationsContainer;
