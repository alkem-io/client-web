import { sortBy } from 'lodash';
import React, { FC, useMemo } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../hooks';
import { useUpdatePreferenceOnUserMutation, useUserNotificationsPreferencesQuery } from '../../hooks/generated/graphql';
import { ContainerChildProps } from '../../models/container';
import { Preference, PreferenceType, UserPreferenceType } from '../../models/graphql-schema';

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

const excludeNotifications = [PreferenceType.NotificationCommunicationDiscussionResponse];

const UserNotificationsContainer: FC<UserNotificationsContainerProps> = ({ children }) => {
  const { userNameId = '' } = useUrlParams();

  const handleError = useApolloErrorHandler();
  const { data, loading } = useUserNotificationsPreferencesQuery({
    variables: {
      userId: userNameId,
    },
  });

  const [updatePreferenceOnUser] = useUpdatePreferenceOnUserMutation({
    onError: handleError,
  });

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

  const preferences = useMemo(
    () =>
      sortBy(
        (data?.user.preferences || []).filter(p => !excludeNotifications.includes(p.definition.type)),
        x => x.definition.displayName
      ),
    [data]
  );

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
