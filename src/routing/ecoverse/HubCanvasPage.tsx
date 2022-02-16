import React, { FC, useMemo } from 'react';
import { PageProps } from '../../pages';
import { HubContainerEntities, HubContainerState } from '../../containers/hub/HubPageContainer';
import HubCanvasManagementView from '../../views/Hub/HubCanvasManagementView';
import { useUpdateNavigation } from '../../hooks';

export interface HubCanvasPageProps extends PageProps {
  entities: HubContainerEntities;
  state: HubContainerState;
}

const HubCanvasPage: FC<HubCanvasPageProps> = ({ paths, entities, state }) => {
  const currentPaths = useMemo(() => [...paths, { value: '/canvases', name: 'canvases', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  if (!entities.hub) {
    return <></>;
  }

  return (
    <HubCanvasManagementView
      entities={{ hub: entities.hub }}
      state={{ loading: state.loading, error: state.error }}
      actions={undefined}
      options={undefined}
    />
  );
};
export default HubCanvasPage;
