import { useEffect } from 'react';
import type { CollaborationState } from './unifiedCollabProvider';

export const useCollaborationBeforeUnload = (state: CollaborationState, hasUnsaved: boolean) => {
  const warn =
    hasUnsaved &&
    ((state.kind === 'active' && state.access === 'write' && state.save !== 'saved') || state.kind === 'ended');
  useEffect(() => {
    if (!warn) return;
    const prevent = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [warn]);
};
