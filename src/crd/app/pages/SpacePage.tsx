import { useState } from 'react';
import { CalloutSidebarList } from '@/crd/components/callout/CalloutSidebarList';
import { CommentThread } from '@/crd/components/comment/CommentThread';
import { SpaceFeed } from '@/crd/components/space/SpaceFeed';
import { SpaceHeader } from '@/crd/components/space/SpaceHeader';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceNavigationTabs } from '@/crd/components/space/SpaceNavigationTabs';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';
import { SpaceShell } from '@/crd/layouts/SpaceShell';
import {
  MOCK_MEMBERS,
  MOCK_COMMENTS,
  MOCK_ORGANIZATIONS,
  MOCK_POSTS,
  MOCK_SIDEBAR,
  MOCK_SPACE_BANNER,
  MOCK_SUBSPACES,
  MOCK_TABS,
} from '../data/space';

export function SpacePage() {
  const [activeTab, setActiveTab] = useState(0);

  const sidebarVariant = (() => {
    switch (activeTab) {
      case 1:
        return 'community' as const;
      case 2:
        return 'subspaces' as const;
      case 3:
        return 'knowledge' as const;
      default:
        return 'home' as const;
    }
  })();

  const sidebar = (
    <SpaceSidebar
      variant={sidebarVariant}
      description={MOCK_SIDEBAR.description}
      // Home
      onAboutClick={() => {}}
      subspaces={MOCK_SIDEBAR.subspaces}
      subspacesHref="/space/green-energy?tab=3"
      events={[]}
      onShowCalendar={() => {}}
      // Community
      leads={sidebarVariant === 'community' ? MOCK_SIDEBAR.leads : undefined}
      onContactLead={sidebarVariant === 'community' ? () => {} : undefined}
      onInvite={sidebarVariant === 'community' ? () => {} : undefined}
      canInvite={sidebarVariant === 'community'}
      virtualContributors={sidebarVariant === 'community' ? MOCK_SIDEBAR.virtualContributors : undefined}
      guidelines={sidebarVariant === 'community' ? MOCK_SIDEBAR.guidelines : undefined}
      // Knowledge
      knowledgeEntries={sidebarVariant === 'knowledge' ? MOCK_SIDEBAR.knowledgeEntries : undefined}
      onKnowledgeEntryClick={id => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    >
      {sidebarVariant === 'knowledge' && (
        <CalloutSidebarList
          items={MOCK_POSTS.map(p => ({
            id: p.id,
            title: p.title,
            type: p.type === 'whiteboard' ? 'whiteboard' : 'text',
          }))}
          onItemClick={id => {
            const el = document.getElementById(id);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      )}
    </SpaceSidebar>
  );

  return (
    <SpaceShell
      header={
        <SpaceHeader
          title={MOCK_SPACE_BANNER.title}
          tagline={MOCK_SPACE_BANNER.tagline}
          bannerUrl={MOCK_SPACE_BANNER.bannerUrl}
          isHomeSpace={MOCK_SPACE_BANNER.isHomeSpace}
          memberAvatars={MOCK_SPACE_BANNER.memberAvatars}
          memberCount={MOCK_SPACE_BANNER.memberCount}
          actions={{
            showDocuments: true,
            showVideoCall: false,
            showShare: true,
            showSettings: true,
            settingsHref: '/space/green-energy/settings',
            onDocumentsClick: () => {},
            onShareClick: () => {},
          }}
          onMemberClick={() => setActiveTab(1)}
        />
      }
      sidebar={sidebar}
      tabs={<SpaceNavigationTabs tabs={MOCK_TABS} activeIndex={activeTab} onTabChange={setActiveTab} />}
    >
      {/* Tab content */}
      {activeTab === 0 && (
        <div className="space-y-8">
          <SpaceFeed
            title="Activity"
            posts={MOCK_POSTS}
            canCreate={true}
            onCreateClick={() => {}}
            hasMore={true}
            onShowMore={() => {}}
          />

          <CommentThread
            comments={MOCK_COMMENTS}
            canComment={true}
            currentUser={{ id: 'u1', name: 'Sarah Chen', avatarUrl: MOCK_SPACE_BANNER.memberAvatars[0]?.url }}
            onAddComment={() => {}}
            onReply={() => {}}
            onDelete={() => {}}
            onAddReaction={() => {}}
            onRemoveReaction={() => {}}
          />
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-8">
          <SpaceMembers members={[...MOCK_MEMBERS, ...MOCK_ORGANIZATIONS]} />
          <SpaceFeed posts={MOCK_POSTS.slice(0, 2)} />
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-8">
          <SpaceSubspacesList subspaces={MOCK_SUBSPACES} canCreate={true} onCreateClick={() => {}} />
          <SpaceFeed posts={MOCK_POSTS.slice(2)} />
        </div>
      )}

      {activeTab === 3 && (
        <SpaceFeed title="Knowledge Base" posts={MOCK_POSTS} canCreate={true} onCreateClick={() => {}} />
      )}
    </SpaceShell>
  );
}
