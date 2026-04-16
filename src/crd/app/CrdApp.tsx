import { BookOpen, Compass, Lightbulb, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { InvitationDetailDialog } from '@/crd/components/dashboard/InvitationDetailDialog';
import { PendingApplicationCard } from '@/crd/components/dashboard/PendingApplicationCard';
import { PendingInvitationCard } from '@/crd/components/dashboard/PendingInvitationCard';
import { PendingMembershipsListDialog } from '@/crd/components/dashboard/PendingMembershipsListDialog';
import { PendingMembershipsSection } from '@/crd/components/dashboard/PendingMembershipsSection';
import { NotificationsPanel } from '@/crd/components/notifications/NotificationsPanel';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import { MarkdownConfigProvider } from '@/crd/lib/markdownConfig';
import {
  MOCK_INVITATION_DETAIL,
  MOCK_NOTIFICATION_FILTERS,
  MOCK_NOTIFICATION_ITEMS,
  MOCK_PENDING_APPLICATIONS,
  MOCK_PENDING_INVITATIONS,
  MOCK_PENDING_VC_INVITATIONS,
} from './data/dashboard';
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
  const { t } = useTranslation('crd-dashboard');
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');

  const totalPendingCount =
    MOCK_PENDING_INVITATIONS.length + MOCK_PENDING_VC_INVITATIONS.length + MOCK_PENDING_APPLICATIONS.length;

  const demoIframeAllowedUrls = [
    'https://www.youtube.com',
    'https://www.youtube-nocookie.com',
    'https://player.vimeo.com',
    'https://embed.ted.com',
  ];

  return (
    <MarkdownConfigProvider iframeAllowedUrls={demoIframeAllowedUrls}>
    <BrowserRouter>
      <CrdLayout
        user={MOCK_USER}
        authenticated={true}
        navigationHrefs={NAVIGATION_HREFS}
        isAdmin={true}
        pendingInvitationsCount={totalPendingCount}
        platformNavigationItems={MOCK_PLATFORM_NAVIGATION_ITEMS}
        unreadNotificationsCount={5}
        languages={MOCK_LANGUAGES}
        currentLanguage="en"
        onLanguageChange={code => console.log('Language changed to', code)}
        onNotificationsClick={() => setShowNotifications(true)}
        onPendingMembershipsClick={() => setShowPendingDialog(true)}
        onHelpClick={() => console.log('Help clicked')}
        footerLinks={{ terms: '/terms', privacy: '/privacy', security: '/security', about: '/about' }}
        showGridToggle={true}
      >
        <Routes>
          <Route path="/" element={<DashboardPage onPendingMembershipsClick={() => setShowPendingDialog(true)} />} />
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="/space/:spaceSlug" element={<SpacePage />} />
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </CrdLayout>

      {/* Pending Memberships List Dialog */}
      <PendingMembershipsListDialog open={showPendingDialog} onClose={() => setShowPendingDialog(false)} empty={false}>
        <PendingMembershipsSection title={t('pendingMemberships.invitationsSection')}>
          {MOCK_PENDING_INVITATIONS.map(inv => (
            <li key={inv.id}>
              <PendingInvitationCard
                invitation={inv}
                onClick={() => {
                  setShowPendingDialog(false);
                  setShowDetailDialog(true);
                }}
              />
            </li>
          ))}
        </PendingMembershipsSection>

        <PendingMembershipsSection title={t('pendingMemberships.vcInvitationsSection')}>
          {MOCK_PENDING_VC_INVITATIONS.map(inv => (
            <li key={inv.id}>
              <PendingInvitationCard
                invitation={inv}
                onClick={() => {
                  setShowPendingDialog(false);
                  setShowDetailDialog(true);
                }}
              />
            </li>
          ))}
        </PendingMembershipsSection>

        <PendingMembershipsSection title={t('pendingMemberships.applicationsSection')}>
          {MOCK_PENDING_APPLICATIONS.map(app => (
            <li key={app.id}>
              <PendingApplicationCard application={app} onClick={() => console.log('Navigate to', app.spaceHref)} />
            </li>
          ))}
        </PendingMembershipsSection>
      </PendingMembershipsListDialog>

      {/* Invitation Detail Dialog */}
      <InvitationDetailDialog
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        onBack={() => {
          setShowDetailDialog(false);
          setShowPendingDialog(true);
        }}
        invitation={MOCK_INVITATION_DETAIL}
        title={`Invitation to ${MOCK_INVITATION_DETAIL.spaceName}`}
        acceptLabel={t('pendingMemberships.detail.join')}
        rejectLabel={t('pendingMemberships.detail.reject')}
        descriptionSlot={
          <p className="text-muted-foreground">
            <strong>Sarah Chen</strong> invited you to join <strong>{MOCK_INVITATION_DETAIL.spaceName}</strong> as a
            member.
          </p>
        }
        welcomeMessageSlot={
          <p>
            We would love to have you join our sustainability initiative. Your expertise in urban planning and community
            engagement would be invaluable to our efforts. We meet every Wednesday to discuss progress and plan next
            steps.
          </p>
        }
        onAccept={() => {
          console.log('Invitation accepted');
          setShowDetailDialog(false);
        }}
        accepting={false}
        onReject={() => {
          console.log('Invitation declined');
          setShowDetailDialog(false);
          setShowPendingDialog(true);
        }}
        rejecting={false}
        updating={false}
      />

      {/* Notifications Panel */}
      <NotificationsPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        items={MOCK_NOTIFICATION_ITEMS}
        filters={MOCK_NOTIFICATION_FILTERS}
        selectedFilter={notificationFilter}
        hasMore={true}
        settingsHref="/profile/settings/notifications"
        onFilterChange={setNotificationFilter}
        onMarkAllRead={() => console.log('Mark all read')}
        onLoadMore={() => console.log('Load more notifications')}
        onNotificationClick={n => console.log('Notification clicked', n.id)}
        onRead={id => console.log('Read', id)}
        onUnread={id => console.log('Unread', id)}
        onArchive={id => console.log('Archive', id)}
      />
    </BrowserRouter>
    </MarkdownConfigProvider>
  );
}
