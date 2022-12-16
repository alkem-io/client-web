import React, { FC, useCallback } from 'react';
import { ApplicationForRoleResult, User } from '../../../../core/apollo/generated/graphql-schema';
import { APPLICATION_STATE_NEW, APPLICATION_STATE_REJECTED } from '../constants/ApplicationState';
import { useApolloErrorHandler } from '../../../../core/apollo/hooks/useApolloErrorHandler';
import {
  refetchUserApplicationsQuery,
  useDeleteUserApplicationMutation,
  useUserProfileApplicationsQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import getApplicationWithType, {
  ApplicationWithType,
} from '../../../../common/utils/application/getApplicationWithType';
import sortApplications from '../../../../common/utils/application/sortApplications';

export interface PendingApplicationsProps {
  entities: {
    userId: User['id'];
  };
  children: (
    entities: PendingApplicationsEntities,
    actions: PendingApplicationsActions,
    state: PendingApplicationsState
  ) => React.ReactNode;
}

export interface PendingApplicationsActions {
  handleDelete: (application: ApplicationWithType) => void;
}

export interface PendingApplicationsState {
  isDeleting: boolean;
  loading: boolean;
}

export interface PendingApplicationsEntities {
  applications: ApplicationWithType[];
}

const PendingApplicationsContainer: FC<PendingApplicationsProps> = ({ children, entities }) => {
  const handleError = useApolloErrorHandler();

  const { data: memberShip, loading: loadingMembership } = useUserProfileApplicationsQuery({
    variables: {
      input: {
        userID: entities.userId,
      },
    },
  });
  const applications = (memberShip?.rolesUser?.applications || []) as ApplicationForRoleResult[];
  const appsWithType = applications
    .filter(x => x.state === APPLICATION_STATE_NEW || x.state === APPLICATION_STATE_REJECTED)
    .map(getApplicationWithType)
    .sort(sortApplications);

  const [deleteApplication, { loading: isDeleting }] = useDeleteUserApplicationMutation({
    onError: handleError,
  });

  const handleDelete = useCallback(
    (application: ApplicationWithType) => {
      deleteApplication({
        variables: {
          input: {
            ID: application.id,
          },
        },
        refetchQueries: [refetchUserApplicationsQuery({ input: { userID: entities.userId } })],
        awaitRefetchQueries: true,
      });
    },
    [entities, deleteApplication]
  );

  return <>{children({ applications: appsWithType }, { handleDelete }, { isDeleting, loading: loadingMembership })}</>;
};

export default PendingApplicationsContainer;
