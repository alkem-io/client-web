import { BookOpen, Compass, Lightbulb, MessageCircle } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SpacePage } from './pages/SpacePage';
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

const MOCK_PLATFORM_NAVIGATION_ITEMS = [
  { icon: <Lightbulb className="h-4 w-4" />, label: 'Innovation Library', href: '/innovation-library' },
  { icon: <MessageCircle className="h-4 w-4" />, label: 'Forum', href: '/forum' },
  { icon: <Compass className="h-4 w-4" />, label: 'Explore Spaces', href: '/spaces' },
  { icon: <BookOpen className="h-4 w-4" />, label: 'Documentation', href: '/docs' },
];

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
        platformNavigationItems={MOCK_PLATFORM_NAVIGATION_ITEMS}
        unreadNotificationsCount={5}
        languages={MOCK_LANGUAGES}
        currentLanguage="en"
        onLanguageChange={code => console.log('Language changed to', code)}
        onPendingMembershipsClick={() => console.log('Pending memberships clicked')}
        onHelpClick={() => console.log('Help clicked')}
        footerLinks={{ terms: '/terms', privacy: '/privacy', security: '/security', about: '/about' }}
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="/space/:spaceSlug" element={<SpacePage />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </CrdLayout>
    </BrowserRouter>
  );
}
