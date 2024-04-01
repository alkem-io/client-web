import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import AISettingsPage from './AISettingsPage';

const AISettingsRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AISettingsPage />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};

export default AISettingsRoutes;
