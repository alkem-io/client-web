import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';

const PHASE_PARAM = 'phase';

export type UseCrdSubspaceFlowResult = {
  activePhaseId: string | undefined;
  setActivePhaseId: (id: string) => void;
};

export function useCrdSubspaceFlow(
  phases: SubspaceFlowPhase[],
  currentStateId: string | undefined
): UseCrdSubspaceFlowResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const fromUrl = searchParams.get(PHASE_PARAM);
  const validUrlPhase = fromUrl && phases.some(p => p.id === fromUrl) ? fromUrl : undefined;
  const validCurrentState = currentStateId && phases.some(p => p.id === currentStateId) ? currentStateId : undefined;

  const activePhaseId = validUrlPhase ?? validCurrentState ?? phases[0]?.id;

  const setActivePhaseId = useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams);
      next.set(PHASE_PARAM, id);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return { activePhaseId, setActivePhaseId };
}
