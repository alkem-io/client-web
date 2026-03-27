import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import { SpacesPage } from './pages/SpacesPage';

const MOCK_USER = {
  name: 'Alex Rivera',
  avatarUrl: undefined,
  initials: 'AR',
};

const NAVIGATION_HREFS = {
  home: '/',
  spaces: '/spaces',
  messages: '/messages',
  notifications: '/notifications',
  profile: '/profile',
  settings: '/settings',
};

export function CrdApp() {
  return (
    <BrowserRouter>
      <CrdLayout user={MOCK_USER} authenticated={true} navigationHrefs={NAVIGATION_HREFS}>
        <Routes>
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="*" element={<Navigate to="/spaces" replace={true} />} />
        </Routes>
      </CrdLayout>
    </BrowserRouter>
  );
}
