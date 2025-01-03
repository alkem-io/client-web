import { sortBy } from 'lodash';
import { PropsWithChildren, useMemo } from 'react';
import { useUrlParams } from '@/core/routing/useUrlParams';
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

const UserNotificationsContainer = ({ children }: PropsWithChildren<UserNotificationsContainerProps>) => {
  const { userNameId = '' } = useUrlParams();

  const { data, loading } = useUserNotificationsPreferencesQuery({
    variables: {
      userId: userNameId,
    },
  });

  const [updatePreferenceOnUser] = useUpdatePreferenceOnUserMutation({});

  const userUUID = data?.user.id;

  const updatePreference = (type: PreferenceType, checked: boolean, id: string) => {
    if (!userUUID) {
      return;
    }

    updatePreferenceOnUser({
      variables: {
        input: {
          type: type,
          userID: userUUID,
          value: checked ? 'true' : 'false',
        },
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

  const preferences = useMemo(() => sortBy(data?.user.preferences ?? [], x => x.definition.displayName), [data]);

  return (
    <>
      {children(
        {
          preferences,
        },
        { loading },
        { updatePreference }
      )}
    </>
  );
};

export default UserNotificationsContainer;
