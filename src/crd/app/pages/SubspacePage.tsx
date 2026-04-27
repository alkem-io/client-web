import { useState } from 'react';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SubspaceCommunityDialog } from '@/crd/components/space/SubspaceCommunityDialog';
import { SubspaceFlowTabs, type SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';
import { SubspaceHeader, type SubspaceHeaderActionsData } from '@/crd/components/space/SubspaceHeader';
import { SubspaceSidebar, type SubspaceQuickActionId } from '@/crd/components/space/SubspaceSidebar';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { MOCK_MEMBERS } from '../data/space';

const SUBSPACE_ID = 'mock-subspace-1';
const PARENT_ID = 'mock-parent-1';

const PHASES: SubspaceFlowPhase[] = [
  { id: 'discover', label: 'Discover' },
  { id: 'define', label: 'Define' },
  { id: 'develop', label: 'Develop' },
  { id: 'deliver', label: 'Deliver' },
];

const ACTIONS: SubspaceHeaderActionsData = {
  showActivity: true,
  showVideoCall: true,
  showShare: true,
  showSettings: true,
  shareUrl: '/preview/share',
  settingsHref: '/preview/settings',
};

const MEMBER_AVATARS = MOCK_MEMBERS.slice(0, 5).map(m => ({
  id: m.id,
  url: m.avatarUrl,
  initials: m.name.slice(0, 2).toUpperCase(),
}));

export function SubspacePage() {
  const [activePhaseId, setActivePhaseId] = useState<string | undefined>(PHASES[0]?.id);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<SubspaceQuickActionId | null>(null);

  const handleQuickAction = (id: SubspaceQuickActionId) => {
    if (id === 'community') {
      setCommunityOpen(true);
    } else {
      setActiveDialog(id);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SubspaceHeader
        title="Renewable Energy Transition"
        tagline="Developing strategies for municipal energy transition to 100% renewables by 2030."
        subspaceInitials="RE"
        subspaceColor={pickColorFromId(SUBSPACE_ID)}
        parentName="Green Energy Space"
        parentInitials="GE"
        parentColor={pickColorFromId(PARENT_ID)}
        badgeLabel="SubSpace"
        actions={ACTIONS}
        memberAvatars={MEMBER_AVATARS}
        onMemberClick={() => setCommunityOpen(true)}
      />

      <main className="flex-1 w-full px-6 md:px-8 py-8">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-8 lg:col-start-2 min-w-0">
            <div className="sticky top-16 z-10 pt-4 pb-3 mb-4 bg-background/95 backdrop-blur-sm">
              <SubspaceFlowTabs
                phases={PHASES}
                activePhaseId={activePhaseId}
                onPhaseChange={setActivePhaseId}
                canEditFlow={true}
                canAddPost={true}
                editFlowHref="/preview/flow-editor"
                onAddPostClick={() => console.log('Add post')}
              />
            </div>
            <div className="space-y-4 text-body text-muted-foreground">
              <p>Active phase: {activePhaseId}</p>
              <p>This is a preview shell — real callouts feed wires up at integration time.</p>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2 sticky top-24 self-start">
            <SubspaceSidebar
              whyMarkdown="**Why this subspace?** We need to align municipal stakeholders behind a common decarbonisation roadmap."
              tagline="Municipal energy transition coordination."
              leads={[
                {
                  id: 'lead-1',
                  name: 'David Kim',
                  initials: 'DK',
                  href: '/preview/user/david-kim',
                  location: 'Berlin, DE',
                },
              ]}
              virtualContributor={{
                id: 'vc-1',
                name: 'Design Advisor',
                initials: 'DA',
                description: 'AI assistant trained on design thinking and collaboration frameworks.',
                href: '/preview/vc/design-advisor',
              }}
              onAboutClick={() => console.log('Open About dialog')}
              onQuickActionClick={handleQuickAction}
            />
          </div>
        </div>
      </main>

      <SubspaceCommunityDialog
        open={communityOpen}
        onOpenChange={setCommunityOpen}
        title="Community"
        description="People and organizations participating in this subspace."
      >
        <SpaceMembers members={MOCK_MEMBERS} pageSize={9} />
      </SubspaceCommunityDialog>

      {/* Stub dialogs for the other Quick Actions — wired in integration layer */}
      {activeDialog && (
        <SubspaceCommunityDialog
          open={activeDialog !== null}
          onOpenChange={open => setActiveDialog(open ? activeDialog : null)}
          title={activeDialog}
          description="Stub dialog — real connector wires up at integration time."
        >
          <p className="text-body text-muted-foreground">{activeDialog} dialog content placeholder.</p>
        </SubspaceCommunityDialog>
      )}
    </div>
  );
}
