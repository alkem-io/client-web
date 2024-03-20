import React, { ComponentType, FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import ApplyPage from '../pages/ApplyPage';
import NoIdentityRedirect from '../../../../core/routing/NoIdentityRedirect';
import { EntityPageLayoutHolder } from '../../../journey/common/EntityPageLayout';
import { ChallengePageLayoutProps } from '../../../journey/challenge/layout/ChallengePageLayout';
import { SpacePageLayoutProps } from '../../../journey/space/layout/SpacePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

interface Props {
  type: ApplicationTypeEnum;
  journeyPageLayoutComponent: ComponentType<SpacePageLayoutProps | ChallengePageLayoutProps>;
}

const ApplyRoute: FC<Props> = ({ journeyPageLayoutComponent: JourneyPageLayout, type }) => {
  return (
    <Routes>
      <Route path="/" element={<EntityPageLayoutHolder />}>
        <Route
          index
          element={
            <NoIdentityRedirect>
              <JourneyPageLayout currentSection={EntityPageSection.Dashboard} unauthorizedDialogDisabled>
                <ApplyPage type={type} />
              </JourneyPageLayout>
            </NoIdentityRedirect>
          }
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default ApplyRoute;
