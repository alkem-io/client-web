import { useSearchParams } from 'react-router-dom';

const PHASE_PARAM = 'phase';

export type UseCrdSubspaceFlowResult = {
  activePhaseId: string | undefined;
  setActivePhaseId: (id: string) => void;
};

/**
 * The active phase: `?phase` when it names a stage, else the current stage when it is one. The current stage is not
 * served yet (021 tasks.md S01), so without `?phase` there is no active phase, never a guessed first one.
 */
export function useCrdSubspaceFlow(
  phases: ReadonlyArray<{ id: string }>,
  currentStateId: string | undefined
): UseCrdSubspaceFlowResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const fromUrl = searchParams.get(PHASE_PARAM);
  const validUrlPhase = fromUrl && phases.some(p => p.id === fromUrl) ? fromUrl : undefined;
  const validCurrentState = currentStateId && phases.some(p => p.id === currentStateId) ? currentStateId : undefined;

  const activePhaseId = validUrlPhase ?? validCurrentState;

  const setActivePhaseId = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(PHASE_PARAM, id);
    setSearchParams(next, { replace: true });
  };

  return { activePhaseId, setActivePhaseId };
}
