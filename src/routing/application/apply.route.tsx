import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Error404, PageProps } from '../../pages';
import ApplyPage from '../../pages/Application/ApplyPage';
import RestrictedRoute from '../RestrictedRoute';

interface Props extends PageProps {
  type: ApplicationTypeEnum;
}

const ApplyRoute: FC<Props> = ({ paths, type }) => {
  return (
    <Routes>
      <Route
        element={
          <RestrictedRoute>
            <ApplyPage paths={paths} type={type} />
          </RestrictedRoute>
        }
      />
      <Route path="*">
        <Error404 />
      </Route>
    </Routes>
  );
};
export default ApplyRoute;
