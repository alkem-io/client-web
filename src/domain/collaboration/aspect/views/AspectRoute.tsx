import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { EntityTypeName } from '../../../shared/layout/LegacyPageLayout/SimplePageLayout';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import ContributePage from '../../contribute/ContributePage';
import AspectDashboardPage from '../pages/AspectDashboardPage';
import AspectSettingsPage from '../pages/AspectSettingsPage';
import AspectSharePage from '../pages/AspectSharePage';
import { AspectDialogSection } from './AspectDialogSection';
import { AspectLayoutHolder } from './AspectLayoutWithOutlet';

export interface AspectRouteProps {
  parentPagePath: string;
  entityTypeName: EntityTypeName;
}

const AspectRoute: FC<AspectRouteProps> = ({ parentPagePath, entityTypeName }) => {
  const [backToExplore] = useBackToParentPage(parentPagePath, { keepScroll: true });
  const onClose = () => backToExplore();

  return (
    <Routes>
      <Route path="/" element={<AspectLayoutHolder />}>
        <Route index element={<Navigate replace to={AspectDialogSection.Dashboard} state={{ keepScroll: true }} />} />
        <Route
          path={AspectDialogSection.Dashboard}
          element={
            <ContributePage entityTypeName={entityTypeName}>
              <AspectDashboardPage onClose={onClose} />
            </ContributePage>
          }
        />
        <Route
          path={AspectDialogSection.Share}
          element={
            <ContributePage entityTypeName={entityTypeName}>
              <AspectSharePage onClose={onClose} />
            </ContributePage>
          }
        />
        <Route
          path={AspectDialogSection.Settings}
          element={
            <ContributePage entityTypeName={entityTypeName}>
              <AspectSettingsPage onClose={onClose} />
            </ContributePage>
          }
        />
      </Route>
    </Routes>
  );
};

export default AspectRoute;
