import { DialogContent } from '@mui/material';
import DialogHeader from '@core/ui/dialog/DialogHeader';
import DialogWithGrid from '@core/ui/dialog/DialogWithGrid';
import { useDashboardContext } from '../DashboardContext';
import { DashboardDialog } from './DashboardDialogsProps';
import { TipsAndTricks } from '../tipsAndTricks/TipsAndTricks';
import { useTranslation } from 'react-i18next';
import MyLatestContributions from '../latestContributions/myLatestContributions/MyLatestContributions';
import LatestContributions from '../latestContributions/LatestContributions';
import { useLatestContributionsSpacesFlatQuery } from '@core/apollo/generated/apollo-hooks';

const DashboardDialogs = () => {
  const { t } = useTranslation();
  const { isOpen, setIsOpen } = useDashboardContext();

  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

  return (
    <>
      <DialogWithGrid open={isOpen === DashboardDialog.TipsAndTricks}>
        <DialogHeader onClose={() => setIsOpen(undefined)}>{t('pages.home.sections.tipsAndTricks.title')}</DialogHeader>
        <DialogContent>
          <TipsAndTricks />
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid open={isOpen === DashboardDialog.MyActivity}>
        <DialogHeader onClose={() => setIsOpen(undefined)}>
          {t('pages.home.sections.myLatestContributions.title')}
        </DialogHeader>
        <DialogContent>
          <MyLatestContributions spaceMemberships={flatSpacesWithMemberships} />
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid open={isOpen === DashboardDialog.MySpaceActivity}>
        <DialogHeader onClose={() => setIsOpen(undefined)}>
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
