import React, { ComponentType, FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import ApplyPage from '../pages/ApplyPage';
import RestrictedRoute from '../../../../core/routing/RestrictedRoute';
import { EntityPageLayoutHolder } from '../../../shared/layout/PageLayout';
import { ChallengePageLayoutProps } from '../../../challenge/challenge/layout/ChallengePageLayout';
import { HubPageLayoutProps } from '../../../challenge/hub/layout/HubPageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

interface Props extends PageProps {
  type: ApplicationTypeEnum;
  entityPageLayout: ComponentType<HubPageLayoutProps | ChallengePageLayoutProps>;
}

const ApplyRoute: FC<Props> = ({ paths, entityPageLayout: EntityPageLayout, type }) => {
  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route
          index
          element={
            <RestrictedRoute>
              <EntityPageLayout currentSection={EntityPageSection.Dashboard}>
                <ApplyPage paths={paths} type={type} />
              </EntityPageLayout>
            </RestrictedRoute>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
export default ApplyRoute;
