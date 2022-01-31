import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import EditVisualsView from '../../../views/Visuals/EditVisualsView';
import { useEcoverse, useUpdateNavigation } from '../../../hooks';

export interface EcoverseVisualsPageProps extends PageProps {}

const EcoverseVisualsPage: FC<EcoverseVisualsPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'visuals', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { ecoverse } = useEcoverse();

  return <EditVisualsView visuals={ecoverse?.context?.visuals} />;
};
export default EcoverseVisualsPage;
