import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AuthorizationPrivilege, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { SubspaceFlowTabs } from '@/crd/components/space/SubspaceFlowTabs';
import { TabStateHeader } from '@/crd/components/space/TabStateHeader';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { CalloutFormConnector } from '../../space/callout/CalloutFormConnector';
import { CalloutListConnector } from '../../space/callout/CalloutListConnector';
import { useCrdSubspaceFlow } from '../hooks/useCrdSubspaceFlow';
import type { SubspaceOutletContext } from '../layout/CrdSubspacePageLayout';

export default function CrdSubspaceCalloutsPage() {
  const { data, mobileMenu } = useOutletContext<SubspaceOutletContext>();
  const { phases, currentPhaseId, calloutsSetId, canEditFlow, subspaceUrl } = data;
  const [createOpen, setCreateOpen] = useState(false);
  const { activePhaseId, setActivePhaseId } = useCrdSubspaceFlow(phases, currentPhaseId);
  const isSmallScreen = useMediaQuery('(max-width: 639px)');

  const activePhase = phases.find(p => p.id === activePhaseId);
  const classificationTagsets = activePhase ? [{ name: TagsetReservedName.FlowState, tags: [activePhase.label] }] : [];

  const {
    callouts,
    loading: calloutsLoading,
    calloutsSetAuthorization,
    canCreateCallout,
  } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    skip: !calloutsSetId || phases.length === 0,
  });
  // Reordering callouts requires Update on the calloutsSet (not the callout).
  const canReorderCallouts = calloutsSetAuthorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  // Creating a post (callout) is gated by the calloutsSet's CreateCallout privilege — the same
  // gate every L0 space tab uses. The previous `canAddPost` checked the space-entity `Create`
  // privilege, which only admins hold, so members never saw the Add Post button on L1 even when
  // contributions were enabled for them.

  const editFlowHref = subspaceUrl ? `${subspaceUrl}/settings/layout` : undefined;

  const flowTabs = (
    <SubspaceFlowTabs
      phases={phases}
      activePhaseId={activePhaseId}
      onPhaseChange={setActivePhaseId}
      canEditFlow={canEditFlow}
      canAddPost={canCreateCallout && phases.length > 0}
      editFlowHref={editFlowHref}
      onAddPostClick={() => setCreateOpen(true)}
      mobileMenuOpen={mobileMenu.open}
      onMobileMenuOpenChange={mobileMenu.onOpenChange}
      mobileMenuContent={mobileMenu.content}
    />
  );

  return (
    <div className="space-y-6">
      {isSmallScreen ? (
        flowTabs
      ) : (
        <div className="sticky top-16 z-10 pt-4 pb-3 bg-background/95 backdrop-blur-sm">{flowTabs}</div>
      )}

      {/* Active phase description — collapsible (2 lines, 3 on small screens)
          with a "See full description" toggle, identical to the L0 tab
          flow-state description. */}
      {activePhase?.description && <TabStateHeader description={activePhase.description} />}

      {phases.length > 0 && (
        <CalloutListConnector
          callouts={callouts ?? []}
          calloutsSetId={calloutsSetId}
          canCreate={false}
          canReorder={canReorderCallouts}
          loading={calloutsLoading}
        />
      )}

      {/* Mobile bottom-bar clearance: only render when the fixed bar / FAB is actually shown
          (i.e. when there are phases — otherwise SubspaceFlowTabs renders the empty state). */}
      {phases.length > 0 && <div className="h-36 sm:hidden" aria-hidden="true" />}

      {canCreateCallout && calloutsSetId && (
        <CalloutFormConnector
          open={createOpen}
          onOpenChange={setCreateOpen}
          calloutsSetId={calloutsSetId}
          activeFlowStateName={activePhase?.label}
          defaultTemplateId={activePhase?.defaultCalloutTemplateId}
        />
      )}
    </div>
  );
}
