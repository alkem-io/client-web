import { FormControlLabel, Switch } from '@mui/material';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { DashboardMenuProps } from './dashboardMenuTypes';
import { useDashboardContext } from '../DashboardContext';

/* TODO: extrat in dialogs */
/*
  <TipsAndTricks />
  <InnovationLibraryBlock />
  <NewMembershipsBlock hiddenIfEmpty />
  <MyLatestContributions />
  <RecentForumMessages />
*/

export const DashboardMenu = ({ compact = false }: DashboardMenuProps) => {
  const context = useDashboardContext();

  const changeView = (event: React.ChangeEvent<HTMLInputElement>) => {
    context.setActivityEnabled(event.target.checked);
  };

  return (
    <PageContentBlock>
      Menu
      {!compact && (
        <FormControlLabel
          label="Activity View"
          control={<Switch name={'view'} checked={context.activityEnabled} onChange={changeView} />}
        />
      )}
    </PageContentBlock>
  );
};
