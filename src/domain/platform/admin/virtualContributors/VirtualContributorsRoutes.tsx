import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { EditMode } from '../../../../core/ui/forms/editMode';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import VirtualContributorsList from './VirtualContributorsList';
import VirtualContributorPage from './VirtualContributorPage';
import { nameOfUrl } from '../../../../main/routing/urlParams';

export const VirtualContributorsRoutes: FC = () => {
  return (
    <Routes>
      <Route index element={<VirtualContributorsList />} />
      {/* creating users is disabled */}
      {/* <Route path={`new`}>
      <UserPage mode={EditMode.new} paths={currentPaths} title="New user" />
    </Route> */}
      <Route path={`:${nameOfUrl.userNameId}/edit`} element={<VirtualContributorPage mode={EditMode.edit} />} />
      <Route path={`:${nameOfUrl.userNameId}`} element={<VirtualContributorPage mode={EditMode.readOnly} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
