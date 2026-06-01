import { useState } from 'react';
import { CalloutWhiteboardPreview } from '@/crd/components/callout/CalloutWhiteboardPreview';
import { CalloutDetailDialog } from '@/crd/components/callout/CalloutDetailDialog';
import { CalloutPostPreview } from '@/crd/components/callout/CalloutPostPreview';
import { WhiteboardDisplayName } from '@/crd/components/whiteboard/WhiteboardDisplayName';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
import { WhiteboardCollabFooter } from '@/crd/components/whiteboard/WhiteboardCollabFooter';
import { CalloutPoll } from '@/crd/components/callout/CalloutPoll';
import type { PollOptionData } from '@/crd/components/callout/CalloutPoll';
import { CalloutSidebarList } from '@/crd/components/callout/CalloutSidebarList';
import { CommentInput } from '@/crd/components/comment/CommentInput';
import { CommentThread } from '@/crd/components/comment/CommentThread';
import { ContributionAddCard } from '@/crd/components/contribution/ContributionAddCard';
import { ContributionGrid } from '@/crd/components/contribution/ContributionGrid';
import { ContributionLinkList } from '@/crd/components/contribution/ContributionLinkList';
import { ContributionMemoCard } from '@/crd/components/contribution/ContributionMemoCard';
import { ContributionPostCard } from '@/crd/components/contribution/ContributionPostCard';
import { ContributionWhiteboardCard } from '@/crd/components/contribution/ContributionWhiteboardCard';
import { PostCard } from '@/crd/components/space/PostCard';
import type { PostCardData } from '@/crd/components/space/PostCard';
import { SpaceFeed } from '@/crd/components/space/SpaceFeed';
import { SpaceHeader } from '@/crd/components/space/SpaceHeader';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SpaceNavigationTabs } from '@/crd/components/space/SpaceNavigationTabs';
import { SpaceSidebar } from '@/crd/components/space/SpaceSidebar';
import { SpaceSubspacesList } from '@/crd/components/space/SpaceSubspacesList';
import { SpaceShell } from '@/crd/layouts/SpaceShell';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { AddPostModal } from '@/crd/forms/callout/AddPostModal';
import { FramingChipStrip } from '@/crd/forms/callout/FramingChipStrip';
import type { FramingChipId } from '@/crd/forms/callout/FramingChipStrip';
import { ResponseTypeChipStrip } from '@/crd/forms/callout/ResponseTypeChipStrip';
import type { ResponseTypeChipId } from '@/crd/forms/callout/ResponseTypeChipStrip';
import { MemoFramingEditor } from '@/crd/forms/callout/MemoFramingEditor';
import { AllowCommentsField } from '@/crd/forms/callout/AllowCommentsField';
import { ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { SpaceAboutDialog } from '@/crd/components/space/SpaceAboutDialog';
import type { SpaceAboutData } from '@/crd/components/space/SpaceAboutView';
import { Button } from '@/crd/primitives/button';
import { MessageSquare, PenTool } from 'lucide-react';
import {
  AVATARS,
  MOCK_CALLOUT_DIALOG,
  MOCK_MEMBERS,
  MOCK_COMMENTS,
  MOCK_LINK_CONTRIBUTIONS,
  MOCK_MEMO_CONTRIBUTIONS,
  MOCK_ORGANIZATIONS,
  MOCK_POST_CONTRIBUTIONS,
  MOCK_WHITEBOARD_CONTRIBUTIONS,
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
  const [dialogPost, setDialogPost] = useState<PostCardData | null>(null);
  const [selectedContribution, setSelectedContribution] = useState<string | null>(null);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);

  // Add Post modal state
  const [addPostOpen, setAddPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [framingChip, setFramingChip] = useState<FramingChipId | 'none'>('none');
  const [responseType, setResponseType] = useState<ResponseTypeChipId | 'none'>('none');
  const [memoContent, setMemoContent] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [references, setReferences] = useState<ReferenceRow[]>([{ name: '', uri: '', description: '' }]);
  const [aboutOpen, setAboutOpen] = useState(false);

  const MOCK_ABOUT_DATA: SpaceAboutData = {
    name: 'Green Energy Space',
    tagline: 'Collaborating on the future of sustainable energy solutions and urban transformation.',
    description:
      'This space brings together municipalities, researchers, and community organizations to develop and implement renewable energy strategies. We focus on practical, scalable solutions that can be adopted by cities of all sizes.\n\n**Our mission:** Accelerate the transition to 100% renewable energy in urban areas by 2035 through collaborative innovation and shared knowledge.',
    location: 'Netherlands',
    metrics: [
      { name: 'Members', value: '42' },
    ],
    why: 'Cities account for 70% of global energy consumption. By working together across municipalities, we can share learnings, reduce costs, and accelerate the transition to clean energy. This space exists to break silos between local governments and foster peer-to-peer knowledge exchange.',
    who: 'Municipal sustainability officers, urban planners, energy researchers, community organizers, and technology providers working on the ground in European cities. We welcome anyone committed to practical climate action at the local level.',
    provider: {
      name: 'Alkemio Foundation',
      avatarUrl: undefined,
      type: 'organization',
      location: 'The Hague, Netherlands',
      href: '/organization/alkemio',
    },
    leadUsers: [
      { name: 'Sarah Chen', avatarUrl: undefined, type: 'person', location: 'Amsterdam', href: '/user/sarah-chen' },
      { name: 'David Kim', avatarUrl: undefined, type: 'person', location: 'Rotterdam', href: '/user/david-kim' },
    ],
    leadOrganizations: [
      { name: 'GreenTech Initiative', avatarUrl: undefined, type: 'organization', location: 'Utrecht', href: '/organization/greentech' },
    ],
    references: [
      { name: 'EU Green Deal Overview', uri: 'https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal_en', description: 'Official EU policy framework' },
      { name: 'Municipal Transition Playbook', uri: 'https://example.com/playbook', description: 'Step-by-step guide for city-level energy transitions' },
      { name: 'Community Solar Toolkit', uri: 'https://example.com/solar-toolkit' },
    ],
  };

  const openDialog = (post: PostCardData) => {
    setDialogPost(post);
    setSelectedContribution(null);
    setDialogOpen(true);
  };

  const currentUser = { id: 'u1', name: 'Sarah Chen', avatarUrl: MOCK_SPACE_BANNER.memberAvatars[0]?.url };

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
      onAboutClick={() => setAboutOpen(true)}
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
            color={pickColorFromId('mock-space-green-energy')}
            isHomeSpace={MOCK_SPACE_BANNER.isHomeSpace}
            actions={{
              showActivity: true,
              showVideoCall: false,
              showShare: true,
              showSettings: true,
              settingsHref: '/space/green-energy/settings',
              onActivityClick: () => {},
              onShareClick: () => {},
            }}
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
              canCreate={true}
              onCreateClick={() => setAddPostOpen(true)}
              hasMore={true}
              onShowMore={() => {}}
            >
              {MOCK_POSTS.map(post => {
                let contributionsPreview: React.ReactNode;

                // Memo-contribution callout: grid of memo cards with "+N more" overlay
                if (post.id === 'p-memo-contribs') {
                  const visible = MOCK_MEMO_CONTRIBUTIONS.slice(0, 3);
                  const total = MOCK_MEMO_CONTRIBUTIONS.length;
                  const overlayItem = MOCK_MEMO_CONTRIBUTIONS[3];
                  contributionsPreview = (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {visible.map(memo => (
                        <ContributionMemoCard
                          key={memo.id}
                          title={memo.title}
                          markdownContent={memo.markdownContent}
                          author={memo.author}
                        />
                      ))}
                      {total > 4 && overlayItem && (
                        <button
                          type="button"
                          className="relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 min-h-[180px] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <div className="p-4 h-full">
                            <div className="text-caption text-muted-foreground line-clamp-6">
                              {overlayItem.markdownContent}
                            </div>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
                            <span className="text-white font-bold text-subsection-title">+{total - 3} more</span>
                          </div>
                        </button>
                      )}
                      <ContributionAddCard label="Add memo" icon={MessageSquare} onClick={() => openDialog(post)} />
                    </div>
                  );
                }

                // Call-for-ideas callout: grid of whiteboard cards with "+N more" overlay (mirrors prototype)
                if (post.id === 'p2') {
                  const visible = MOCK_WHITEBOARD_CONTRIBUTIONS.slice(0, 3);
                  const total = MOCK_WHITEBOARD_CONTRIBUTIONS.length;
                  const overlayItem = MOCK_WHITEBOARD_CONTRIBUTIONS[3];
                  contributionsPreview = (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {visible.map(wb => (
                        <ContributionWhiteboardCard
                          key={wb.id}
                          title={wb.title}
                          previewUrl={wb.previewUrl}
                          author={wb.author}
                        />
                      ))}
                      {total > 4 && overlayItem && (
                        <button
                          type="button"
                          className="relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 min-h-[180px] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <img src={overlayItem.previewUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
                            <span className="text-white font-bold text-subsection-title">+{total - 3} more</span>
                          </div>
                        </button>
                      )}
                      <ContributionAddCard label="Add whiteboard" icon={PenTool} onClick={() => openDialog(post)} />
                    </div>
                  );
                }

                // Design Sprint whiteboard contributions — reuses MOCK_WHITEBOARD_CONTRIBUTIONS
                if (post.id === 'p-wb-contributions') {
                  const visible = MOCK_WHITEBOARD_CONTRIBUTIONS.slice(0, 3);
                  const total = MOCK_WHITEBOARD_CONTRIBUTIONS.length;
                  const overlayItem = MOCK_WHITEBOARD_CONTRIBUTIONS[3];
                  contributionsPreview = (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {visible.map(wb => (
                        <ContributionWhiteboardCard
                          key={wb.id}
                          title={wb.title}
                          previewUrl={wb.previewUrl}
                          author={wb.author}
                        />
                      ))}
                      {total > 4 && overlayItem && (
                        <button
                          type="button"
                          className="relative w-full rounded-lg overflow-hidden border border-border bg-muted/30 min-h-[180px] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <img src={overlayItem.previewUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
                            <span className="text-white font-bold text-subsection-title">+{total - 3} more</span>
                          </div>
                        </button>
                      )}
                      <ContributionAddCard label="Add whiteboard" icon={PenTool} onClick={() => openDialog(post)} />
                    </div>
                  );
                }

                // Post contributions — grid of post cards with "Add post" card
                if (post.id === 'p-post-contributions') {
                  const visible = MOCK_POST_CONTRIBUTIONS.slice(0, 4);
                  contributionsPreview = (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {visible.map(pc => (
                        <ContributionPostCard
                          key={pc.id}
                          title={pc.title}
                          author={pc.author}
                          createdDate={pc.createdDate}
                          description={pc.description}
                          tags={pc.tags}
                          commentCount={pc.commentCount}
                          onClick={() => openDialog(post)}
                        />
                      ))}
                      <ContributionAddCard label="Add post" icon={MessageSquare} onClick={() => openDialog(post)} />
                    </div>
                  );
                }

                // Poll post — renders the poll component as children
                let pollChildren: React.ReactNode;
                if (post.id === 'p-poll') {
                  pollChildren = (
                    <CalloutPoll
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
                      showAddCustomOption={false}
                      isAddingCustomOption={false}
                      onChange={setPollSelected}
                      onRemoveVote={() => setPollSelected([])}
                    />
                  );
                }

                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => openDialog(post)}
                    contributionsPreview={contributionsPreview}
                    commentsSlot={
                      <CommentThread
                        comments={post.commentCount ? MOCK_COMMENTS : []}
                        currentUser={currentUser}
                        onReply={() => {}}
                        onDelete={() => {}}
                        onAddReaction={() => {}}
                        onRemoveReaction={() => {}}
                      />
                    }
                    commentInputSlot={
                      <CommentInput currentUser={currentUser} onSubmit={() => {}} />
                    }
                  >
                    {pollChildren}
                  </PostCard>
                );
              })}
            </SpaceFeed>

            <div className="border rounded-xl p-6 bg-card">
              <h3 className="text-subsection-title mb-4">What should we prioritize next?</h3>
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
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-control hover:bg-primary/90 transition-colors"
                onClick={() => {
                  setDialogPost(MOCK_POSTS[0]);
                  setSelectedContribution(null);
                  setDialogOpen(true);
                }}
              >
                View Callout Detail Dialog
              </button>
            </div>

            <CalloutDetailDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              callout={{
                id: dialogPost?.id ?? 'callout-1',
                title: dialogPost?.title ?? '',
                author: dialogPost?.author,
                description: dialogPost?.snippet,
                timestamp: dialogPost?.timestamp,
                commentCount: dialogPost?.commentCount,
                tags: dialogPost?.tags,
                references: dialogPost?.references,
              }}
              hasContributions={
                dialogPost?.id === 'p2' ||
                dialogPost?.id === 'p-wb-contributions' ||
                dialogPost?.id === 'p-memo-contribs' ||
                dialogPost?.id === 'p-post-contributions' ||
                dialogPost?.id === 'p-references'
              }
              contributionsCount={
                dialogPost?.id === 'p-post-contributions'
                  ? MOCK_POST_CONTRIBUTIONS.length
                  : dialogPost?.id === 'p-memo-contribs'
                    ? MOCK_MEMO_CONTRIBUTIONS.length
                    : dialogPost?.id === 'p-references'
                      ? MOCK_LINK_CONTRIBUTIONS.length
                      : (dialogPost?.id === 'p2' || dialogPost?.id === 'p-wb-contributions')
                        ? MOCK_WHITEBOARD_CONTRIBUTIONS.length
                        : undefined
              }
              contributionsSlot={
                dialogPost?.id === 'p-post-contributions' ? (
                  <ContributionGrid totalCount={MOCK_POST_CONTRIBUTIONS.length + 1} collapsedRows={1}>
                    {MOCK_POST_CONTRIBUTIONS.map(pc => (
                      <ContributionPostCard
                        key={pc.id}
                        title={pc.title}
                        author={pc.author}
                        createdDate={pc.createdDate}
                        description={pc.description}
                        tags={pc.tags}
                        commentCount={pc.commentCount}
                        onClick={() => setSelectedContribution(pc.id)}
                      />
                    ))}
                    <ContributionAddCard label="Add post" icon={MessageSquare} />
                  </ContributionGrid>
                ) : dialogPost?.id === 'p-memo-contribs' ? (
                  <ContributionGrid totalCount={MOCK_MEMO_CONTRIBUTIONS.length + 1} collapsedRows={1}>
                    {MOCK_MEMO_CONTRIBUTIONS.map(memo => (
                      <ContributionMemoCard
                        key={memo.id}
                        title={memo.title}
                        markdownContent={memo.markdownContent}
                        author={memo.author}
                        onClick={() => setSelectedContribution(memo.id)}
                      />
                    ))}
                    <ContributionAddCard label="Add memo" icon={MessageSquare} />
                  </ContributionGrid>
                ) : (dialogPost?.id === 'p2' || dialogPost?.id === 'p-wb-contributions') ? (
                  <ContributionGrid totalCount={MOCK_WHITEBOARD_CONTRIBUTIONS.length + 1} collapsedRows={1}>
                    {MOCK_WHITEBOARD_CONTRIBUTIONS.map(wb => (
                      <ContributionWhiteboardCard
                        key={wb.id}
                        title={wb.title}
                        previewUrl={wb.previewUrl}
                        author={wb.author}
                        onClick={() => setSelectedContribution(wb.id)}
                      />
                    ))}
                    <ContributionAddCard label="Add whiteboard" icon={PenTool} />
                  </ContributionGrid>
                ) : dialogPost?.id === 'p-references' ? (
                  <ContributionLinkList
                    links={MOCK_LINK_CONTRIBUTIONS}
                    canAdd={true}
                    onAdd={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ) : undefined
              }
              selectedContributionSlot={
                selectedContribution ? (
                  <CalloutPostPreview
                    post={{
                      id: selectedContribution,
                      title:
                        MOCK_POST_CONTRIBUTIONS.find(p => p.id === selectedContribution)?.title ??
                        MOCK_WHITEBOARD_CONTRIBUTIONS.find(w => w.id === selectedContribution)?.title ??
                        MOCK_MEMO_CONTRIBUTIONS.find(m => m.id === selectedContribution)?.title ??
                        'Response',
                      author: (() => {
                        const pc = MOCK_POST_CONTRIBUTIONS.find(p => p.id === selectedContribution);
                        if (pc) return { name: pc.author.name, avatarUrl: pc.author.avatarUrl, profileUrl: '/user/contributor' };
                        const wb = MOCK_WHITEBOARD_CONTRIBUTIONS.find(w => w.id === selectedContribution);
                        if (wb) return { name: wb.author, avatarUrl: AVATARS.david, profileUrl: '/user/contributor' };
                        const memo = MOCK_MEMO_CONTRIBUTIONS.find(m => m.id === selectedContribution);
                        if (memo) return { name: memo.author, avatarUrl: AVATARS.elena, profileUrl: '/user/contributor' };
                        return { name: 'Unknown' };
                      })(),
                      timestamp: '2 hours ago',
                      description:
                        MOCK_POST_CONTRIBUTIONS.find(p => p.id === selectedContribution)?.description ??
                        MOCK_MEMO_CONTRIBUTIONS.find(m => m.id === selectedContribution)?.markdownContent ??
                        'Click to view the full contribution details.',
                      tags: MOCK_POST_CONTRIBUTIONS.find(p => p.id === selectedContribution)?.tags ?? [],
                    }}
                    onEdit={() => {}}
                    onClose={() => setSelectedContribution(null)}
                  />
                ) : undefined
              }
              whiteboardFramingSlot={
                dialogPost?.type === 'whiteboard' ? (
                  <div className="rounded-lg border border-border bg-muted/30 aspect-video flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <PenTool className="size-12 mx-auto mb-2 opacity-50" />
                      <p className="text-body-emphasis">Whiteboard Preview</p>
                      <p className="text-caption">Interactive editing not available in preview</p>
                    </div>
                  </div>
                ) : undefined
              }
              commentsSlot={
                <CommentThread
                  comments={MOCK_COMMENTS}
                  currentUser={currentUser}
                  onReply={() => {}}
                  onDelete={() => {}}
                  onAddReaction={() => {}}
                  onRemoveReaction={() => {}}
                />
              }
              commentInputSlot={
                <CommentInput currentUser={currentUser} onSubmit={() => {}} />
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
            <SpaceSubspacesList subspaces={MOCK_SUBSPACES} />
            <SpaceFeed posts={MOCK_POSTS.slice(2)} />
          </div>
        )}

        {activeTab === 3 && (
          <SpaceFeed title="Knowledge Base" posts={MOCK_POSTS} canCreate={true} onCreateClick={() => setAddPostOpen(true)} />
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
            <p className="text-subsection-title">Excalidraw Canvas Area</p>
            <p className="text-body">In the real app, the collaborative Excalidraw editor renders here</p>
          </div>
        </div>
      </WhiteboardEditorShell>

      {/* About This Space Dialog */}
      <SpaceAboutDialog
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        data={MOCK_ABOUT_DATA}
        whyTitle="Why are we here?"
        whoTitle="Who is involved?"
        guidelinesSlot={
          <div className="rounded-lg border border-border p-4 bg-muted/30">
            <h4 className="text-body-emphasis font-medium mb-2">Community Guidelines</h4>
            <p className="text-caption text-muted-foreground">
              Be respectful, constructive, and focused on practical solutions. All contributions should be evidence-based
              and actionable. We encourage open dialogue and diverse perspectives.
            </p>
          </div>
        }
        contactHostSlot={
          <Button variant="outline" size="sm" onClick={() => console.log('Contact host')}>
            Contact Host
          </Button>
        }
      />

      {/* Add Post Modal */}
      <AddPostModal
        open={addPostOpen}
        onOpenChange={setAddPostOpen}
        mode="create"
        title={{ value: postTitle, onChange: setPostTitle }}
        canSubmit={postTitle.trim().length > 0}
        onSubmit={() => {
          console.log('Publish post:', { postTitle, postDescription, framingChip, responseType, memoContent });
          setAddPostOpen(false);
          setPostTitle('');
          setPostDescription('');
          setFramingChip('none');
          setResponseType('none');
          setMemoContent('');
        }}
        onSaveDraft={() => console.log('Save draft')}
        onFindTemplate={() => console.log('Find template')}
        descriptionSlot={
          <MarkdownEditor
            value={postDescription}
            onChange={setPostDescription}
            placeholder="Describe what this post is about..."
          />
        }
        framingZoneSlot={
          <div className="space-y-4">
            <FramingChipStrip value={framingChip} onChange={setFramingChip} />
            {framingChip === 'memo' && (
              <MemoFramingEditor value={memoContent} onChange={setMemoContent} />
            )}
            {framingChip === 'whiteboard' && (
              <div className="p-4 border rounded-xl bg-muted/30 animate-in fade-in">
                <p className="text-body text-muted-foreground">Whiteboard editor will appear here after publishing.</p>
              </div>
            )}
            {framingChip === 'document' && (
              <div className="p-4 border rounded-xl bg-muted/30 animate-in fade-in">
                <p className="text-body text-muted-foreground">Document editor will be attached after publishing.</p>
              </div>
            )}
            {framingChip === 'cta' && (
              <div className="p-4 border rounded-xl bg-muted/30 animate-in fade-in">
                <p className="text-body text-muted-foreground">Call-to-action link fields will appear here.</p>
              </div>
            )}
            {framingChip === 'image' && (
              <div className="p-4 border rounded-xl bg-muted/30 animate-in fade-in">
                <p className="text-body text-muted-foreground">Image/media gallery upload zone will appear here.</p>
              </div>
            )}
            {framingChip === 'poll' && (
              <div className="p-4 border rounded-xl bg-muted/30 animate-in fade-in">
                <p className="text-body text-muted-foreground">Poll options editor will appear here.</p>
              </div>
            )}
          </div>
        }
        responsesZoneSlot={
          <ResponseTypeChipStrip value={responseType} onChange={setResponseType} />
        }
        moreOptionsSlot={
          <div className="space-y-4">
            <AllowCommentsField value={allowComments} onChange={setAllowComments} />
            <ReferencesEditor rows={references} onChange={setReferences} />
          </div>
        }
      />
    </>
  );
}
