import React, { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { EntityTypeName } from '../../../shared/layout/PageLayout/SimplePageLayout';
import useBackToParentPage from '../../../shared/utils/useBackToParentPage';
import CalloutsPageLayout from '../../callout/CalloutsPageLayout';
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
            <CalloutsPageLayout rootUrl={parentPagePath} entityTypeName={entityTypeName}>
              {<AspectDashboardPage onClose={onClose} />}
            </CalloutsPageLayout>
          }
        />
        <Route
          path={AspectDialogSection.Share}
          element={
            <CalloutsPageLayout rootUrl={parentPagePath} entityTypeName={entityTypeName}>
              {<AspectSharePage onClose={onClose} />}
            </CalloutsPageLayout>
          }
        />
        <Route
          path={AspectDialogSection.Settings}
          element={
            <CalloutsPageLayout rootUrl={parentPagePath} entityTypeName={entityTypeName}>
              {<AspectSettingsPage onClose={onClose} />}
            </CalloutsPageLayout>
          }
        />
      </Route>
    </Routes>
  );
};

export default AspectRoute;
