import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageProps, Error404 } from '../../../pages';
import CommunityContextFeedbackPage from '../../../pages/Community/CommunityContextFeedbackPage';
import RestrictedRoute from '../../../routing/RestrictedRoute';

const CommunityFeedbackRoute: FC<PageProps> = ({ paths }) => {
  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <RestrictedRoute>
              <CommunityContextFeedbackPage paths={paths} />
            </RestrictedRoute>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
export default CommunityFeedbackRoute;
