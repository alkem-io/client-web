import { DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useDashboardContext } from '../DashboardContext';
import { DashboardDialog } from './DashboardDialogsProps';
import { TipsAndTricks } from '../tipsAndTricks/TipsAndTricks';
import { useTranslation } from 'react-i18next';
import MyLatestContributions from '../latestContributions/myLatestContributions/MyLatestContributions';
import LatestContributions from '../latestContributions/LatestContributions';
import { useLatestContributionsSpacesFlatQuery } from '@/core/apollo/generated/apollo-hooks';

const DashboardDialogs = () => {
  const { t } = useTranslation();
  const { isOpen, setIsOpen } = useDashboardContext();

  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

  const handleClose = () => setIsOpen(undefined);

  return (
    <>
      <DialogWithGrid
        open={isOpen === DashboardDialog.TipsAndTricks}
        onClose={handleClose}
        aria-labelledby="tips-and-tricks-dialog"
      >
        <DialogHeader id="tips-and-tricks-dialog" onClose={handleClose}>
          {t('pages.home.sections.tipsAndTricks.title')}
        </DialogHeader>
        <DialogContent>
          <TipsAndTricks />
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid
        open={isOpen === DashboardDialog.MyActivity}
        onClose={handleClose}
        aria-labelledby="my-activity-dialog"
      >
        <DialogHeader id="my-activity-dialog" onClose={handleClose}>
          {t('pages.home.sections.myLatestContributions.title')}
        </DialogHeader>
        <DialogContent>
          <MyLatestContributions spaceMemberships={flatSpacesWithMemberships} />
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid
        open={isOpen === DashboardDialog.MySpaceActivity}
        onClose={handleClose}
        aria-labelledby="my-space-activity-dialog"
      >
        <DialogHeader id="my-space-activity-dialog" onClose={handleClose}>
          {t('pages.home.sections.latestContributions.title')}
        </DialogHeader>
        <DialogContent>
          <LatestContributions spaceMemberships={flatSpacesWithMemberships} />
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default DashboardDialogs;
