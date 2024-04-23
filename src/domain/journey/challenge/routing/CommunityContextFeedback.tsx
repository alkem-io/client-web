import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import CommunityContextFeedbackPage from '../../../community/community/pages/CommunityContextFeedbackPage';
import NoIdentityRedirect from '../../../../core/routing/NoIdentityRedirect';

const CommunityFeedbackRoute = () => {
  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <NoIdentityRedirect>
              <CommunityContextFeedbackPage />
            </NoIdentityRedirect>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default CommunityFeedbackRoute;
