import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { SubspaceFlowTabs } from '@/crd/components/space/SubspaceFlowTabs';
import useCalloutsSet from '@/domain/collaboration/calloutsSet/useCalloutsSet/useCalloutsSet';
import { CalloutFormConnector } from '../../space/callout/CalloutFormConnector';
import { CalloutListConnector } from '../../space/callout/CalloutListConnector';
import type { CrdSubspacePageData } from '../hooks/useCrdSubspace';
import { useCrdSubspaceFlow } from '../hooks/useCrdSubspaceFlow';

type SubspaceOutletContext = { data: CrdSubspacePageData };

export default function CrdSubspaceCalloutsPage() {
  const { data } = useOutletContext<SubspaceOutletContext>();
  const { phases, currentPhaseId, calloutsSetId, canEditFlow, canAddPost, subspaceUrl } = data;
  const [createOpen, setCreateOpen] = useState(false);
  const { activePhaseId, setActivePhaseId } = useCrdSubspaceFlow(phases, currentPhaseId);

  const activePhase = phases.find(p => p.id === activePhaseId);
  const classificationTagsets = activePhase ? [{ name: TagsetReservedName.FlowState, tags: [activePhase.label] }] : [];

  const { callouts, loading: calloutsLoading } = useCalloutsSet({
    calloutsSetId,
    classificationTagsets,
    skip: !calloutsSetId || phases.length === 0,
  });

  const editFlowHref = subspaceUrl ? `${subspaceUrl}/settings/layout` : undefined;

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-10 pt-4 pb-3 bg-background/95 backdrop-blur-sm">
        <SubspaceFlowTabs
          phases={phases}
          activePhaseId={activePhaseId}
          onPhaseChange={setActivePhaseId}
          canEditFlow={canEditFlow}
          canAddPost={canAddPost && phases.length > 0}
          editFlowHref={editFlowHref}
          onAddPostClick={() => setCreateOpen(true)}
        />
      </div>

      {phases.length > 0 && (
        <CalloutListConnector
          callouts={callouts ?? []}
          calloutsSetId={calloutsSetId}
          canCreate={false}
          loading={calloutsLoading}
        />
      )}

      {canAddPost && calloutsSetId && (
        <CalloutFormConnector open={createOpen} onOpenChange={setCreateOpen} calloutsSetId={calloutsSetId} />
      )}
    </div>
  );
}
