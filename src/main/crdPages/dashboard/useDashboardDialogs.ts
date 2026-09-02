import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type DashboardDialogType = 'tips-and-tricks' | 'my-activity' | 'my-space-activity' | 'memberships';

const DIALOG_PARAM_KEY = 'dialog';
const INVITATIONS_PARAM_VALUE = 'invitations';

type UseDashboardDialogsOptions = {
  onPendingMembershipsClick?: () => void;
  /**
   * Gate the `dialog=invitations` handling. While `false` (auth not yet resolved
   * or the visitor is unauthenticated) the param is neither stripped nor acted on,
   * so `DashboardPage` can redirect a logged-out invite visitor to sign-up with the
   * URL — including the param — preserved as the returnUrl.
   */
  enabled?: boolean;
};

export function useDashboardDialogs({ onPendingMembershipsClick, enabled = true }: UseDashboardDialogsOptions = {}) {
  const [openDialog, setOpenDialog] = useState<DashboardDialogType | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const dialogParam = searchParams.get(DIALOG_PARAM_KEY);
    if (dialogParam === INVITATIONS_PARAM_VALUE) {
      searchParams.delete(DIALOG_PARAM_KEY);
      setSearchParams(searchParams);
      onPendingMembershipsClick?.();
    }
  }, [searchParams, enabled]);

  const openTipsAndTricks = () => setOpenDialog('tips-and-tricks');
  const openMyActivity = () => setOpenDialog('my-activity');
  const openMySpaceActivity = () => setOpenDialog('my-space-activity');
  const openMemberships = () => setOpenDialog('memberships');
  const closeDialog = () => setOpenDialog(null);

  return {
    openDialog,
    openTipsAndTricks,
    openMyActivity,
    openMySpaceActivity,
    openMemberships,
    closeDialog,
  };
}
