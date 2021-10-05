import React, { FC } from 'react';
import { Container } from '../../models/container';

interface ApplicationContainerEntities {}
interface ApplicationContainerActions {}
interface ApplicationContainerState {}

interface ApplicationContainerProps
  extends Container<ApplicationContainerEntities, ApplicationContainerActions, ApplicationContainerState> {
  entities: {};
}

export const ApplicationContainer: FC<ApplicationContainerProps> = ({ children }) => {
  // TODO: For future use.
  return <div>{children()}</div>;
};
export default ApplicationContainer;
