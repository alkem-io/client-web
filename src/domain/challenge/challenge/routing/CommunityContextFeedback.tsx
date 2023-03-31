import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import CommunityContextFeedbackPage from '../../../community/community/pages/CommunityContextFeedbackPage';
import NoIdentityRedirect from '../../../../core/routing/NoIdentityRedirect';

const CommunityFeedbackRoute: FC<PageProps> = ({ paths }) => {
  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <NoIdentityRedirect>
              <CommunityContextFeedbackPage paths={paths} />
            </NoIdentityRedirect>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default CommunityFeedbackRoute;
