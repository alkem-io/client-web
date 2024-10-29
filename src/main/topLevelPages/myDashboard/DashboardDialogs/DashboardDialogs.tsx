import { DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useDashboardContext } from '../DashboardContext';
import { DashboardDialog } from './DashboardDialogsProps';
import { TipsAndTricks } from '../tipsAndTricks/TipsAndTricks';
import { useTranslation } from 'react-i18next';
import MyLatestContributions from '../latestContributions/myLatestContributions/MyLatestContributions';
import LatestContributions from '../latestContributions/LatestContributions';
import { useLatestContributionsSpacesFlatQuery } from '../../../../core/apollo/generated/apollo-hooks';

export const DashboardDialogs = () => {
  const { t } = useTranslation();
  const { openedDialog, setOpenedDialog } = useDashboardContext();

  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

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
      <DialogWithGrid open={openedDialog === DashboardDialog.MyActivity}>
        <DialogHeader onClose={() => setOpenedDialog(undefined)}>
          {t('pages.home.sections.myLatestContributions.title')}
        </DialogHeader>
        <DialogContent>
          <MyLatestContributions spaceMemberships={flatSpacesWithMemberships} />
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid open={openedDialog === DashboardDialog.MySpaceActivity}>
        <DialogHeader onClose={() => setOpenedDialog(undefined)}>
          {t('pages.home.sections.latestContributions.title')}
        </DialogHeader>
        <DialogContent>
          <LatestContributions spaceMemberships={flatSpacesWithMemberships} />
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};
