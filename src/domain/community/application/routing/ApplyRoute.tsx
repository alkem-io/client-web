import React, { ComponentType, FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ApplicationTypeEnum } from '../constants/ApplicationType';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import ApplyPage from '../pages/ApplyPage';
import NoIdentityRedirect from '../../../../core/routing/NoIdentityRedirect';
import { EntityPageLayoutHolder } from '../../../journey/common/EntityPageLayout';
import { ChallengePageLayoutProps } from '../../../journey/challenge/layout/ChallengePageLayout';
import { SpacePageLayoutProps } from '../../../journey/space/layout/SpacePageLayout';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

interface Props extends PageProps {
  type: ApplicationTypeEnum;
  journeyPageLayoutComponent: ComponentType<SpacePageLayoutProps | ChallengePageLayoutProps>;
}

const ApplyRoute: FC<Props> = ({ paths, journeyPageLayoutComponent: JourneyPageLayout, type }) => {
  return (
    <Routes>
      <Route path="/" element={<EntityPageLayoutHolder />}>
        <Route
          index
          element={
            <NoIdentityRedirect>
              <JourneyPageLayout currentSection={EntityPageSection.Dashboard} unauthorizedDialogDisabled>
                <ApplyPage paths={paths} type={type} />
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
