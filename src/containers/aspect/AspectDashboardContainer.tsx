import React, { FC } from 'react';
import { ApolloError } from '@apollo/client';
import { ContainerProps } from '../../models/container';
import { Aspect } from '../../models/graphql-schema';

export interface AspectDashboardPermissions {
  canRead: boolean;
  canEdit: boolean;
}

export interface AspectDashboardContainerEntities {
  aspect?: Aspect;
  permissions: AspectDashboardPermissions;
}

export interface AspectDashboardContainerActions {}

export interface AspectDashboardContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface AspectDashboardContainerProps
  extends ContainerProps<
    AspectDashboardContainerEntities,
    AspectDashboardContainerActions,
    AspectDashboardContainerState
  > {}

const AspectDashboardContainer: FC<AspectDashboardContainerProps> = ({ children }) => {
  const permissions: AspectDashboardPermissions = {
    canEdit: false,
    canRead: false,
  };

  return <>{children({ permissions }, { loading: false }, {})}</>;
};
export default AspectDashboardContainer;
