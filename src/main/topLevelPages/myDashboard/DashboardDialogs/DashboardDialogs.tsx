import { DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useDashboardContext } from '../DashboardContext';
import { DashboardDialog } from './DashboardDialogsProps';

export const DashboardDialogs = () => {
  const { openedDialog, setOpenedDialog } = useDashboardContext();

  return (
    <>
      <DialogWithGrid open={openedDialog === DashboardDialog.TipsAndTricks}>
        <DialogHeader onClose={() => setOpenedDialog(undefined)}>Tips and Tricks</DialogHeader>
        <DialogContent>Dialog content</DialogContent>
      </DialogWithGrid>
    </>
  );
};
