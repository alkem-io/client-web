import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import CommunityContextFeedbackPage from '../../../community/community/pages/CommunityContextFeedbackPage';
import NonAdminRedirect from '../../../../core/routing/NonAdminRedirect';

const CommunityFeedbackRoute: FC<PageProps> = ({ paths }) => {
  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <NonAdminRedirect>
              <CommunityContextFeedbackPage paths={paths} />
            </NonAdminRedirect>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default CommunityFeedbackRoute;
