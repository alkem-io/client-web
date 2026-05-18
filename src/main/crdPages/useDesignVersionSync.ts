import { useEffect } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { readDesignVersionFromStorage, writeDesignVersionToStorage } from './useCrdEnabled';

// Tracks the user we have already reconciled for, scoped to this page load.
// Resets when the user signs out so a subsequent sign-in (same or different user)
// re-evaluates the cache against the saved preference exactly once.
let lastReconciledUserID: string | undefined;

export function useDesignVersionSync(): void {
  const { isAuthenticated, loadingMe, designVersion, userModel } = useCurrentUserContext();
  const userID = userModel?.id;

  useEffect(() => {
    if (!isAuthenticated || !userID) {
      lastReconciledUserID = undefined;
      return;
    }
    if (loadingMe || designVersion === undefined) return;
    if (lastReconciledUserID === userID) return;

    lastReconciledUserID = userID;

    const current = readDesignVersionFromStorage();
    if (current === designVersion) return;

    writeDesignVersionToStorage(designVersion);
    window.location.reload();
  }, [isAuthenticated, loadingMe, designVersion, userID]);
}
