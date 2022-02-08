import React, { FC, useMemo } from 'react';
import { PageProps } from '../common';
import { useUpdateNavigation } from '../../hooks';
import { useResolvedPath } from 'react-router-dom';
import AspectDashboardView from '../../views/aspect/AspectDashboardView';

export interface AspectDashboardPageProps extends PageProps {}

const AspectDashboardPage: FC<AspectDashboardPageProps> = ({ paths: _paths }) => {
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(() => [..._paths, { value: '', name: 'Dashboard', real: false }], [_paths, resolved]);
  useUpdateNavigation({ currentPaths });

  return <AspectDashboardView entities={{}} state={{ loading: true }} actions={{}} options={{}} />;
};
export default AspectDashboardPage;
