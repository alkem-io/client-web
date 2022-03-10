import { sortBy } from 'lodash';
import React, { FC, useMemo } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../hooks';
import { useUpdatePreferenceOnUserMutation, useUserNotificationsPreferencesQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { Preference, UserPreferenceType } from '../../models/graphql-schema';

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
  extends ContainerProps<
    UserNotificationsContainerEntities,
    UserNotificationsContainerActions,
    UserNotificationsContainerState
  > {}

const limitNotificationsTo = [
  UserPreferenceType.NotificationApplicationReceived,
  UserPreferenceType.NotificationApplicationSubmitted,
  UserPreferenceType.NotificationCommunicationUpdates,
  UserPreferenceType.NotificationCommunicationUpdateSentAdmin,
  UserPreferenceType.NotificationCommunicationDiscussionCreated,
  UserPreferenceType.NotificationCommunicationDiscussionCreatedAdmin,
  UserPreferenceType.NotificationUserSignUp,
];

const UserNotificationsContainer: FC<UserNotificationsContainerProps> = ({ children }) => {
  const { userId = '' } = useUrlParams();

  const handleError = useApolloErrorHandler();
  const { data, loading } = useUserNotificationsPreferencesQuery({
    variables: {
      userId: userId,
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
        (data?.user.preferences || []).filter(p =>
          limitNotificationsTo.includes(p.definition.type as UserPreferenceType)
        ),
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
