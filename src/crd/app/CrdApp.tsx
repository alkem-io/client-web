import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import { SpacesPage } from './pages/SpacesPage';

const MOCK_USER = {
  name: 'Alex Rivera',
  avatarUrl: undefined,
  initials: 'AR',
  role: 'Beta Tester',
};

const NAVIGATION_HREFS = {
  home: '/',
  spaces: '/spaces',
  messages: '/messages',
  notifications: '/notifications',
  profile: '/profile',
  account: '/profile/settings/account',
  admin: '/admin',
  login: '/login',
};

const MOCK_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'es', label: 'Español' },
  { code: 'bg', label: 'Български' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
];

export function CrdApp() {
  return (
    <BrowserRouter>
      <CrdLayout
        user={MOCK_USER}
        authenticated={true}
        navigationHrefs={NAVIGATION_HREFS}
        isAdmin={true}
        pendingInvitationsCount={3}
        languages={MOCK_LANGUAGES}
        currentLanguage="en"
        onLanguageChange={code => console.log('Language changed to', code)}
        onPendingMembershipsClick={() => console.log('Pending memberships clicked')}
        onHelpClick={() => console.log('Help clicked')}
        footerLinks={{ terms: '/terms', privacy: '/privacy', security: '/security', about: '/about' }}
      >
        <Routes>
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="*" element={<Navigate to="/spaces" replace={true} />} />
        </Routes>
      </CrdLayout>
    </BrowserRouter>
  );
}
