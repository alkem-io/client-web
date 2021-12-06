import React, { FC } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../hooks';
import { useUpdateUserPreferencesMutation, useUserNotificationsPreferencesQuery } from '../../hooks/generated/graphql';
import { ContainerProps } from '../../models/container';
import { UserPreference, UserPreferenceType } from '../../models/graphql-schema';

export interface UserNotificationsContainerEntities {
  preferences: UserPreference[];
}

export interface UserNotificationsContainerState {
  loading: boolean;
}

export interface UserNotificationsContainerActions {
  updatePreference: (name: string, checked: boolean, id: string) => void;
}

export interface UserNotificationsContainerProps
  extends ContainerProps<
    UserNotificationsContainerEntities,
    UserNotificationsContainerActions,
    UserNotificationsContainerState
  > {}

const limitNotifcationsTo = [
  UserPreferenceType.NotificationApplicationReceived,
  UserPreferenceType.NotificationApplicationSubmitted,
  UserPreferenceType.NotificationCommunicationUpdates,
  UserPreferenceType.NotificationCommunicationDiscussionCreated,
  UserPreferenceType.NotificationUserSignUp,
];

const UserNotificationsContainer: FC<UserNotificationsContainerProps> = ({ children }) => {
  const { userId } = useUrlParams();

  const handleError = useApolloErrorHandler();
  const { data, loading } = useUserNotificationsPreferencesQuery({
    variables: {
      userId: userId,
    },
  });

  const userUUID = data?.user.id;

  const [updateUserPreferences] = useUpdateUserPreferencesMutation({
    onError: handleError,
  });

  const updatePreference = (name: string, checked: boolean, id: string) => {
    updateUserPreferences({
      variables: {
        input: {
          type: name as UserPreferenceType,
          userID: userUUID || '',
          value: checked ? 'true' : 'false',
        },
      },
      optimisticResponse: {
        updateUserPreference: {
          id: id,
          __typename: 'UserPreference',
          value: checked ? 'true' : 'false',
        },
      },
    });
  };

  const preferences = (data?.user.preferences || []).filter(p => limitNotifcationsTo.includes(p.definition.type));

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
