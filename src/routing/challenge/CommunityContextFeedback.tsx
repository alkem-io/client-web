import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404, PageProps } from '../../pages';
import CommunityContextFeedbackPage from '../../pages/Community/CommunityContextFeedbackPage';
import RestrictedRoute from '../RestrictedRoute';

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
