import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type DashboardDialogType = 'tips-and-tricks' | 'my-activity' | 'my-space-activity' | 'memberships';

const DIALOG_PARAM_KEY = 'dialog';
const INVITATIONS_PARAM_VALUE = 'invitations';

type UseDashboardDialogsOptions = {
  onPendingMembershipsClick?: () => void;
};

export function useDashboardDialogs({ onPendingMembershipsClick }: UseDashboardDialogsOptions = {}) {
  const [openDialog, setOpenDialog] = useState<DashboardDialogType | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const dialogParam = searchParams.get(DIALOG_PARAM_KEY);
    if (dialogParam === INVITATIONS_PARAM_VALUE) {
      setSearchParams({});
      onPendingMembershipsClick?.();
    }
  }, [searchParams]);

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
