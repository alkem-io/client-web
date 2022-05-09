import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ApplicationTypeEnum } from '../../../models/enums/application-type';
import { Error404, PageProps } from '../../../pages';
import ApplyPage from '../pages/ApplyPage';
import RestrictedRoute from '../../../routing/RestrictedRoute';

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
        <Route path="*" element={<Error404 />}></Route>
      </Route>
    </Routes>
  );
};
export default ApplyRoute;
