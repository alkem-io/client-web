import React, { FC } from 'react';
import { useEcoverse, useUserContext } from '../../hooks';
import { Container } from '../../models/container';
import { EcoverseInfoFragment } from '../../models/graphql-schema';

export interface EcoverseContainerEntities {
  ecoverse?: EcoverseInfoFragment;
  permissions: {
    canEdit: boolean;
  };
}

export interface EcoverseContainerActions {}
export interface EcoverseContainerState {
  loading: boolean;
}

export interface EcoversePageContainerProps
  extends Container<EcoverseContainerEntities, EcoverseContainerActions, EcoverseContainerState> {}

export const EcoversePageContainer: FC<EcoversePageContainerProps> = ({ children }) => {
  const { ecoverseId, ecoverse } = useEcoverse();
  const { user } = useUserContext();

  const permissions = {
    canEdit: user?.isEcoverseAdmin(ecoverseId) || false,
  };

  return (
    <>
      {children({
        ecoverse,
        permissions,
      })}
    </>
  );
};
export default EcoversePageContainer;
