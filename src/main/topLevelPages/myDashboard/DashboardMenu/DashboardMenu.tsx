import { FormControlLabel, Switch } from '@mui/material';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { DashboardMenuProps } from './DashboardMenuProps';
import { useDashboardContext } from '../DashboardContext';

/* TODO: extrat in dialogs */
/*
  <TipsAndTricks />
  <InnovationLibraryBlock />
  <NewMembershipsBlock hiddenIfEmpty />
  <MyLatestContributions />
  <RecentForumMessages />
*/

const DashboardMenu = ({ compact = false }: DashboardMenuProps) => {
  const context = useDashboardContext();

  const changeView = (event: React.ChangeEvent<HTMLInputElement>) => {
    context.setActivityEnebled(event.target.checked);
  };

  return (
    <PageContentBlock>
      Menu
      {!compact && (
        <FormControlLabel
          label="Activity View"
          control={<Switch name={'view'} checked={context.activityEnebled} onChange={changeView} />}
        />
      )}
    </PageContentBlock>
  );
};

export default DashboardMenu;
