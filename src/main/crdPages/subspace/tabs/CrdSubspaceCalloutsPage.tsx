import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { SubspaceFlowTabs } from '@/crd/components/space/SubspaceFlowTabs';
import { useMediaQuery } from '@/crd/hooks/useMediaQuery';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { CalloutFormConnector } from '../../space/callout/CalloutFormConnector';
import { CalloutListConnector } from '../../space/callout/CalloutListConnector';
import { useCrdSubspaceFlow } from '../hooks/useCrdSubspaceFlow';
import type { SubspaceOutletContext } from '../layout/CrdSubspacePageLayout';

export default function CrdSubspaceCalloutsPage() {
  const { data, mobileMenu } = useOutletContext<SubspaceOutletContext>();
  const { phases, currentPhaseId, calloutsSetId, canEditFlow, canAddPost, subspaceUrl } = data;
  const [createOpen, setCreateOpen] = useState(false);
  const { activePhaseId, setActivePhaseId } = useCrdSubspaceFlow(phases, currentPhaseId);
  const isSmallScreen = useMediaQuery('(max-width: 639px)');

  const activePhase = phases.find(p => p.id === activePhaseId);
  const classificationTagsets = activePhase ? [{ name: TagsetReservedName.FlowState, tags: [activePhase.label] }] : [];

  const { callouts, loading: calloutsLoading } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    skip: !calloutsSetId || phases.length === 0,
  });

  const editFlowHref = subspaceUrl ? `${subspaceUrl}/settings/layout` : undefined;

  const flowTabs = (
    <SubspaceFlowTabs
      phases={phases}
      activePhaseId={activePhaseId}
      onPhaseChange={setActivePhaseId}
      canEditFlow={canEditFlow}
      canAddPost={canAddPost && phases.length > 0}
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

      {/* Active phase description — secondary title between tabs and feed (mirrors the prototype). */}
      {activePhase?.description && (
        <MarkdownContent
          content={activePhase.description}
          className="text-body text-muted-foreground [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p:last-child]:mb-0"
        />
      )}

      {phases.length > 0 && (
        <CalloutListConnector
          callouts={callouts ?? []}
          calloutsSetId={calloutsSetId}
          canCreate={false}
          loading={calloutsLoading}
        />
      )}

      {/* Mobile bottom-bar clearance: only render when the fixed bar / FAB is actually shown
          (i.e. when there are phases — otherwise SubspaceFlowTabs renders the empty state). */}
      {phases.length > 0 && <div className="h-36 sm:hidden" aria-hidden="true" />}

      {canAddPost && calloutsSetId && (
        <CalloutFormConnector
          open={createOpen}
          onOpenChange={setCreateOpen}
          calloutsSetId={calloutsSetId}
          activeFlowStateName={activePhase?.label}
        />
      )}
    </div>
  );
}
