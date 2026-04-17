import { useState } from 'react';
import { CalloutWhiteboardPreview } from '@/crd/components/callout/CalloutWhiteboardPreview';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
import { WhiteboardDisplayName } from '@/crd/components/whiteboard/WhiteboardDisplayName';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
import { WhiteboardCollabFooter } from '@/crd/components/whiteboard/WhiteboardCollabFooter';
import { CalloutPoll } from '@/crd/components/callout/CalloutPoll';
import type { PollOptionData } from '@/crd/components/callout/CalloutPoll';
import { CalloutSidebarList } from '@/crd/components/callout/CalloutSidebarList';
import { CommentInput } from '@/crd/components/comment/CommentInput';
import { CommentThread } from '@/crd/components/comment/CommentThread';
import { SpaceFeed } from '@/crd/components/space/SpaceFeed';
import { SpaceHeader } from '@/crd/components/space/SpaceHeader';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceNavigationTabs } from '@/crd/components/space/SpaceNavigationTabs';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';
import { SpaceShell } from '@/crd/layouts/SpaceShell';
import {
  MOCK_CALLOUT_DIALOG,
  MOCK_MEMBERS,
  MOCK_COMMENTS,
  MOCK_ORGANIZATIONS,
  MOCK_POSTS,
  MOCK_SIDEBAR,
  MOCK_SPACE_BANNER,
  MOCK_SUBSPACES,
  MOCK_TABS,
} from '../data/space';

const MOCK_POLL_OPTIONS: PollOptionData[] = [
  {
    id: 'opt-1',
    text: 'Solar energy subsidies',
    sortOrder: 0,
    voteCount: 12,
    votePercentage: 48,
    isSelected: true,
    voters: [
      { id: 'v1', name: 'Sarah Chen', avatarUrl: undefined },
      { id: 'v2', name: 'Alex Rivera', avatarUrl: undefined },
      { id: 'v3', name: 'Jamie Park', avatarUrl: undefined },
    ],
  },
  {
    id: 'opt-2',
    text: 'Wind farm expansion',
    sortOrder: 1,
    voteCount: 8,
    votePercentage: 32,
    isSelected: false,
    voters: [
      { id: 'v4', name: 'Morgan Lee', avatarUrl: undefined },
      { id: 'v5', name: 'Taylor Kim', avatarUrl: undefined },
    ],
  },
  {
    id: 'opt-3',
    text: 'Community battery storage',
    sortOrder: 2,
    voteCount: 5,
    votePercentage: 20,
    isSelected: false,
    voters: [{ id: 'v6', name: 'Jordan Cruz', avatarUrl: undefined }],
  },
];

export function SpacePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [pollSelected, setPollSelected] = useState<string[]>(['opt-1']);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

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
    <>
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
              onPostClick={id => {
                const post = MOCK_POSTS.find(p => p.id === id);
                if (post?.type === 'whiteboard') {
                  setWhiteboardOpen(true);
                }
              }}
            />

            <div className="border rounded-xl p-6 bg-card">
              <h3 className="text-lg font-bold mb-4">What should we prioritize next?</h3>
              <CalloutPoll
                title="Vote for the next initiative"
                options={MOCK_POLL_OPTIONS}
                selectedOptionIds={pollSelected}
                isSingleChoice={true}
                isClosed={false}
                canVote={true}
                showResults={true}
                showTotalOnly={false}
                resultsDetail="full"
                totalVotes={25}
                hasVoted={true}
                isAnonymous={false}
                showAddCustomOption={true}
                isAddingCustomOption={false}
                onSubmitCustomOption={() => {}}
                onChange={setPollSelected}
                onRemoveVote={() => setPollSelected([])}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                onClick={() => setDialogOpen(true)}
              >
                View Callout Detail Dialog
              </button>
            </div>

            <CalloutDetailDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              callout={MOCK_CALLOUT_DIALOG}
              commentsSlot={
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
              }
              commentInputSlot={
                <CommentInput
                  currentUser={{ id: 'u1', name: 'Sarah Chen', avatarUrl: MOCK_SPACE_BANNER.memberAvatars[0]?.url }}
                  onSubmit={() => {}}
                />
              }
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

      {/* Whiteboard editor shell — opens when clicking a whiteboard-type post */}
      <WhiteboardEditorShell
        open={whiteboardOpen}
        fullscreen={true}
        onClose={() => setWhiteboardOpen(false)}
        title={<WhiteboardDisplayName displayName="Brainstorming: Municipal Infrastructure Upgrades" readOnly={true} />}
        headerActions={
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-green-500 mx-1" title="Saved" />
          </div>
        }
        footer={
          <WhiteboardCollabFooter
            canDelete={false}
            readonlyMessage="Collaborative editing active"
            guestWarningVisible={false}
          />
        }
      >
        <div
          className="w-full h-full bg-white flex items-center justify-center"
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        >
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Excalidraw Canvas Area</p>
            <p className="text-sm">In the real app, the collaborative Excalidraw editor renders here</p>
          </div>
        </div>
      </WhiteboardEditorShell>
    </>
  );
}
