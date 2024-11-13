import { sortBy } from 'lodash';
import React, { FC, useMemo } from 'react';
import { useUrlParams } from '@core/routing/useUrlParams';
import {
  useUpdatePreferenceOnUserMutation,
  useUserNotificationsPreferencesQuery,
} from '@core/apollo/generated/apollo-hooks';
import { ContainerChildProps } from '@core/container/container';
import { Preference, UserPreferenceType } from '@core/apollo/generated/graphql-schema';

export interface UserNotificationsContainerEntities {
  preferences: Preference[];
}

export interface UserNotificationsContainerState {
  loading: boolean;
}

export interface UserNotificationsContainerActions {
  updatePreference: (type: UserPreferenceType, checked: boolean, id: string) => void;
}

export interface UserNotificationsContainerProps
  extends ContainerChildProps<
    UserNotificationsContainerEntities,
    UserNotificationsContainerActions,
    UserNotificationsContainerState
  > {}

const UserNotificationsContainer: FC<UserNotificationsContainerProps> = ({ children }) => {
  const { userNameId = '' } = useUrlParams();

  const { data, loading } = useUserNotificationsPreferencesQuery({
    variables: {
      userId: userNameId,
    },
  });

  const [updatePreferenceOnUser] = useUpdatePreferenceOnUserMutation({});

  const userUUID = data?.user.id;

  const updatePreference = (type: UserPreferenceType, checked: boolean, id: string) => {
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
