import { DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useDashboardContext } from '../DashboardContext';
import { DashboardDialog } from './DashboardDialogsProps';
import { TipsAndTricks } from '../tipsAndTricks/TipsAndTricks';
import { useTranslation } from 'react-i18next';

export const DashboardDialogs = () => {
  const { t } = useTranslation();
  const { openedDialog, setOpenedDialog } = useDashboardContext();

  return (
    <>
      <DialogWithGrid open={openedDialog === DashboardDialog.TipsAndTricks}>
        <DialogHeader onClose={() => setOpenedDialog(undefined)}>
          {t('pages.home.sections.tipsAndTricks.title')}
        </DialogHeader>
        <DialogContent>
          <TipsAndTricks />
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};
