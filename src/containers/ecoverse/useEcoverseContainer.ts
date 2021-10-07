import { useEcoverse, useUserContext } from '../../hooks';
import { ContainerHook } from '../../models/container';
import { EcoverseContainerActions, EcoverseContainerEntities, EcoverseContainerState } from './EcoversePageContainer';

export const useEcoverseContainer: ContainerHook<
  EcoverseContainerEntities,
  EcoverseContainerActions,
  EcoverseContainerState
> = () => {
  const { ecoverseId, ecoverse } = useEcoverse();
  const { user } = useUserContext();

  const permissions = {
    canEdit: user?.isEcoverseAdmin(ecoverseId) || false,
  };

  return {
    entities: {
      ecoverse,
      permissions,
    },
  };
};
