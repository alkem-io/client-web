import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityFeed } from '@/crd/components/dashboard/ActivityFeed';
import { CampaignBanner } from '@/crd/components/dashboard/CampaignBanner';
import { DashboardLayout } from '@/crd/components/dashboard/DashboardLayout';
import { DashboardSidebar } from '@/crd/components/dashboard/DashboardSidebar';
import { InvitationsBlock } from '@/crd/components/dashboard/InvitationsBlock';
import { RecentSpaces } from '@/crd/components/dashboard/RecentSpaces';
import { TipsAndTricksDialog } from '@/crd/components/dashboard/TipsAndTricksDialog';
import {
  MOCK_INVITATIONS,
  MOCK_PERSONAL_ACTIVITIES,
  MOCK_RECENT_SPACES,
  MOCK_ROLE_FILTER_OPTIONS,
  MOCK_SIDEBAR_MENU_ITEMS,
  MOCK_SIDEBAR_RESOURCE_SECTIONS,
  MOCK_SPACE_ACTIVITIES,
  MOCK_SPACE_FILTER_OPTIONS,
} from '../data/dashboard';

type TipFromI18n = {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
};

type DashboardPageProps = {
  onPendingMembershipsClick?: () => void;
};

export function DashboardPage({ onPendingMembershipsClick }: DashboardPageProps) {
  const { t } = useTranslation('crd-dashboard');

  const [spaceFilter, setSpaceFilter] = useState('all-spaces');
  const [roleFilter, setRoleFilter] = useState('all-roles');
  const [personalSpaceFilter, setPersonalSpaceFilter] = useState('all-spaces');
  const [showTipsDialog, setShowTipsDialog] = useState(false);
  const [invitations, setInvitations] = useState(MOCK_INVITATIONS);
  const [activityEnabled, setActivityEnabled] = useState(false);

  const tipsRaw = t('tips.items', { returnObjects: true }) as TipFromI18n[];
  const tips = tipsRaw.map((tip, index) => ({
    id: `tip-${index}`,
    title: tip.title,
    description: tip.description,
    href: tip.url,
    imageUrl: tip.imageUrl,
  }));

  const menuItems = MOCK_SIDEBAR_MENU_ITEMS.map(item => {
    if (item.id === 'tips') {
      return { ...item, onClick: () => setShowTipsDialog(true) };
    }
    if (item.id === 'inv') {
      return { ...item, onClick: () => onPendingMembershipsClick?.(), badgeCount: invitations.length };
    }
    return item;
  });

  const handleAcceptInvitation = (id: string) => {
    console.log('Accepted invitation', id);
    setInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  const handleDeclineInvitation = (id: string) => {
    console.log('Declined invitation', id);
    setInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  const hasHomeSpace = MOCK_RECENT_SPACES.some(s => s.isHomeSpace);

  const sidebar = (
    <DashboardSidebar
      menuItems={menuItems}
      resourceSections={MOCK_SIDEBAR_RESOURCE_SECTIONS}
      activityEnabled={activityEnabled}
      onActivityToggle={setActivityEnabled}
      showActivityToggle={true}
    />
  );

  return (
    <>
      <DashboardLayout sidebar={sidebar}>
        <RecentSpaces
          spaces={MOCK_RECENT_SPACES}
          hasHomeSpace={hasHomeSpace}
          onExploreAllClick={() => (window.location.href = '/spaces')}
          onPinClick={() => console.log('Pin clicked')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
          <ActivityFeed
            variant="spaces"
            title={t('activity.spacesTitle')}
            items={MOCK_SPACE_ACTIVITIES}
            spaceFilter={spaceFilter}
            spaceFilterOptions={MOCK_SPACE_FILTER_OPTIONS}
            onSpaceFilterChange={setSpaceFilter}
            roleFilter={roleFilter}
            roleFilterOptions={MOCK_ROLE_FILTER_OPTIONS}
            onRoleFilterChange={setRoleFilter}
            maxItems={5}
            onShowMore={() => console.log('Show more space activity')}
            feedId="spaces"
            className="lg:col-span-5"
          />
          <ActivityFeed
            variant="personal"
            title={t('activity.personalTitle')}
            items={MOCK_PERSONAL_ACTIVITIES}
            spaceFilter={personalSpaceFilter}
            spaceFilterOptions={MOCK_SPACE_FILTER_OPTIONS}
            onSpaceFilterChange={setPersonalSpaceFilter}
            maxItems={5}
            onShowMore={() => console.log('Show more personal activity')}
            feedId="personal"
            className="lg:col-span-4"
          />
        </div>

        {invitations.length > 0 && (
          <InvitationsBlock
            invitations={invitations}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
          />
        )}

        <CampaignBanner onAction={() => console.log('Create virtual contributor clicked')} />
      </DashboardLayout>

      <TipsAndTricksDialog
        open={showTipsDialog}
        onClose={() => setShowTipsDialog(false)}
        tips={tips}
        findMoreHref={t('dialogs.findMoreUrl')}
        findMoreLabel={t('dialogs.findMore')}
      />
    </>
  );
}
