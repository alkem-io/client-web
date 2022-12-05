import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import ApplyPage from '../pages/ApplyPage';
import RestrictedRoute from '../../../../core/routing/RestrictedRoute';
import { EntityPageLayoutHolder } from '../../../shared/layout/PageLayout';
import ChallengePageLayout from '../../../challenge/challenge/layout/ChallengePageLayout';
import HubPageLayout from '../../../challenge/hub/layout/HubPageLayout';
import OpportunityPageLayout from '../../../challenge/opportunity/layout/OpportunityPageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

interface Props extends PageProps {
  type: ApplicationTypeEnum;
}

const EntityLayout: React.FC<{ type: ApplicationTypeEnum }> = ({ type, children }) => {
  switch (type) {
    case ApplicationTypeEnum.challenge:
      return <ChallengePageLayout currentSection={EntityPageSection.Dashboard}>{children}</ChallengePageLayout>;
    case ApplicationTypeEnum.hub:
      return <HubPageLayout currentSection={EntityPageSection.Dashboard}>{children}</HubPageLayout>;
    case ApplicationTypeEnum.opportunity:
      return <OpportunityPageLayout currentSection={EntityPageSection.Dashboard}>{children}</OpportunityPageLayout>;
  }
};

const ApplyRoute: FC<Props> = ({ paths, type }) => {
  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route
          index
          element={
            <RestrictedRoute>
              <EntityLayout type={type}>
                <ApplyPage paths={paths} type={type} />
              </EntityLayout>
            </RestrictedRoute>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
export default ApplyRoute;
