import React, { FC, useMemo } from 'react';
import { PageProps } from '../../pages';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/ecoverse/EcoversePageContainer';
import HubCanvasManagementView from '../../views/Ecoverse/HubCanvasManagementView';
import { useUpdateNavigation } from '../../hooks';

export interface HubCanvasPageProps extends PageProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

const HubCanvasPage: FC<HubCanvasPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  if (!entities.ecoverse) {
    return <></>;
  }

  return (
    <HubCanvasManagementView
      entities={{ hub: entities.ecoverse }}
      state={{ loading: state.loading, error: state.error }}
      actions={undefined}
      options={undefined}
    />
  );
};
export default HubCanvasPage;
