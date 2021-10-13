import React, { FC } from 'react';
import EcoversePageContainer from '../../containers/ecoverse/EcoversePageContainer';
import { useUpdateNavigation } from '../../hooks';
import EcoverseView from '../../views/Ecoverse/EcoverseView';
import { PageProps } from '../common';

interface EcoversePageProps extends PageProps {}

const EcoversePage: FC<EcoversePageProps> = ({ paths }): React.ReactElement => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <EcoversePageContainer>
      {(entities, state) => {
        if (!entities || !state) return null;
        return <EcoverseView entities={entities} state={state} />;
      }}
    </EcoversePageContainer>
  );
};

export { EcoversePage as Ecoverse };
