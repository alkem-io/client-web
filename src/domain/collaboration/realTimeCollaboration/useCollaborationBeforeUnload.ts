import { useEffect } from 'react';

export const useCollaborationBeforeUnload = (hasChangesAtRisk: boolean) => {
  useEffect(() => {
    if (!hasChangesAtRisk) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [hasChangesAtRisk]);
};
