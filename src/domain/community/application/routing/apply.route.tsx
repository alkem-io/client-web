import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import ApplyPage from '../pages/ApplyPage';
import RestrictedRoute from '../../../../core/routing/RestrictedRoute';

interface Props extends PageProps {
  type: ApplicationTypeEnum;
}

const ApplyRoute: FC<Props> = ({ paths, type }) => {
  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <RestrictedRoute>
              <ApplyPage paths={paths} type={type} />
            </RestrictedRoute>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
export default ApplyRoute;
