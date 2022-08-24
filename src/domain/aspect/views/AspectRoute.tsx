import React, { FC } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AspectDashboardPage from '../../../pages/aspect/AspectDashboardPage';
import AspectSettingsPage from '../../../pages/aspect/AspectSettingsPage';
import { AspectDialogSection } from './AspectDialogSection';
import { AspectLayoutHolder } from './AspectLayoutWithOutlet';

export interface AspectRouteProps {
  parentPagePath: string;
}

const AspectRoute: FC<AspectRouteProps> = () => {
  const navigate = useNavigate();
  // todo: do the back nagivation properly
  const onClose = () => navigate(-1); //useBackToParentPage(parentPagePath, { keepScroll: true });

  return (
    <Routes>
      <Route path="/" element={<AspectLayoutHolder />}>
        <Route index element={<Navigate replace to={AspectDialogSection.Dashboard} state={{ keepScroll: true }} />} />
        <Route path={AspectDialogSection.Dashboard} element={<AspectDashboardPage onClose={onClose} />} />
        <Route path={AspectDialogSection.Settings} element={<AspectSettingsPage onClose={onClose} />} />
      </Route>
    </Routes>
  );
};

export default AspectRoute;
