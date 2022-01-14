import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import Loading from '../../components/core/Loading/Loading';
import { useEcoverse } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Ecoverse as EcoversePage, Error404, PageProps } from '../../pages';
import ApplyRoute from '../application/apply.route';

export const EcoverseRoute: FC<PageProps> = ({ paths }) => {
  const { ecoverse, displayName, loading: ecoverseLoading } = useEcoverse();
  const resolved = useResolvedPath('./');
  const currentPaths = useMemo(
    () => (ecoverse ? [...paths, { value: resolved.pathname, name: displayName, real: true }] : paths),
    [paths, displayName]
  );

  const loading = ecoverseLoading;

  if (loading) {
    return <Loading text={'Loading ecoverse'} />;
  }

  if (!ecoverse) {
    return <Error404 />;
  }

  return (
    <Routes>
      <Route path={'/'}>
        <Route index element={<Navigate to={'dashboard'} />} />
        <Route path={'*'} element={<EcoversePage paths={currentPaths} />} />
      </Route>
      <Route path="*" element={<Error404 />}></Route>
      <Route path={'apply'} element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.ecoverse} />}></Route>
    </Routes>
  );
};
