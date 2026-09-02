import { useEffect } from 'react';

/**
 * Registers a `beforeunload` handler while `dirty === true`. Lives in the
 * integration layer (not `src/crd/`) so CRD components stay free of browser-API
 * side effects (CRD Golden Rule #2, plan D15). Mirrors the MUI-style safety net
 * from `src/main/crdPages/topLevelPages/spaceSettings/useDirtyTabGuard.ts`.
 */
export function useBeforeUnloadGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers required returnValue to be set to trigger the prompt.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
