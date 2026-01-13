import { ChangeEvent, useCallback } from 'react';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import BadgeCounter from '@/core/ui/icon/BadgeCounter';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption } from '@/core/ui/typography';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Box, Divider, FormControlLabel, List, ListItem, ListItemButton, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDashboardContext } from '../DashboardContext';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';
import { DashboardMenuProps, MenuOptionProps } from './dashboardMenuTypes';
import { useHomeMenuItems } from './useHomeMenuItems';
import { DIALOG_PARAM_VALUES, useMyDashboardDialogs } from '@/main/topLevelPages/myDashboard/useMyDashboardDialogs';

/**
 * DashboardMenu Component
 *
 * This component renders the home menu with various menu items by type.
 * It uses the `useHomeMenuItems` hook to fetch and prepare the menu items,
 * A special case is the 'invites' type, requiring  a query for the count.
 *
 * @component
 */
export const DashboardMenu = ({ compact = false, expandable = false }: DashboardMenuProps) => {
  const { t } = useTranslation();
  const { activityEnabled, setActivityEnabled, setIsOpen } = useDashboardContext();
  const { items, loading: itemsConfigLoading } = useHomeMenuItems();
  const { setOpenDialog } = usePendingMembershipsDialog();

  const { count: pendingInvitationsCount } = usePendingInvitationsCount();

  const openMembershipsDialog = useCallback(
    () => setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList }),
    [setOpenDialog]
  );

  useMyDashboardDialogs({
    paramValue: DIALOG_PARAM_VALUES.INVITATIONS,
    onDialogOpen: openMembershipsDialog,
    cleanParams: true,
  });

  const changeView = (event: ChangeEvent<HTMLInputElement>) => {
    setActivityEnabled(event.target.checked);
  };

  const getTranslationByKey = (key: string) => t(`${key}` as TranslationKey, { defaultValue: key });

  const openDialog = (dialog: DashboardDialog | undefined) => () => setIsOpen(dialog);

  const getItemContent = (item: MenuOptionProps) => (
    <>
      {item.icon && <item.icon fontSize="small" sx={{ color: 'neutral.light' }} />}
      <Caption paddingLeft={gutters()}>
        <>{getTranslationByKey(item.label)}</>
      </Caption>
    </>
  );

  const renderMenuItem = (item: MenuOptionProps, index: number) => {
    switch (item.type) {
      case 'invites':
        return (
          <ListItem key={index} sx={{ padding: 0 }}>
            <ListItemButton onClick={openMembershipsDialog} sx={{ paddingY: gutters(0.75) }}>
              {getItemContent(item)}
              {pendingInvitationsCount > 0 && (
                <>
                  <Box sx={{ flexGrow: 1 }} />
                  <BadgeCounter
                    count={pendingInvitationsCount}
                    size="small"
                    aria-label={`${pendingInvitationsCount} pending invitations`}
                  />
                </>
              )}
            </ListItemButton>
          </ListItem>
        );
      case 'link':
        return (
          <ListItem key={index} sx={{ padding: 0 }}>
            <ListItemButton
              component={RouterLink}
              to={item.to ?? ''}
              disabled={!item.to}
              sx={{ paddingY: gutters(0.75) }}
            >
              {getItemContent(item)}
            </ListItemButton>
          </ListItem>
        );
      case 'dialog':
        return (
          <ListItem key={index} sx={{ padding: 0 }}>
            <ListItemButton onClick={openDialog(item.dialog)} sx={{ paddingY: gutters(0.75) }}>
              {getItemContent(item)}
            </ListItemButton>
          </ListItem>
        );
      case 'switch':
        return (
          <ListItem key={index} sx={{ paddingY: gutters(0.75) }}>
            <FormControlLabel
              key={index}
              label={
                <Caption paddingLeft={gutters(0.5)}>
                  <>{getTranslationByKey(item.label)}</>
                </Caption>
              }
              control={<Switch size="small" name="view" checked={activityEnabled} onChange={changeView} />}
            />
          </ListItem>
        );
      case 'divider':
        // see https://mui.com/material-ui/react-divider/#accessibility
        return <Divider key={index} component="li" aria-hidden="true" />;
      default:
        return null;
    }
  };

  if (itemsConfigLoading) {
    return null;
  }

  const renderList = () => (
    <List disablePadding>
      {items.filter(item => item.isVisible(activityEnabled, compact)).map((item, index) => renderMenuItem(item, index))}
    </List>
  );

  if (expandable) {
    return (
      <PageContentBlockCollapsible
        disablePadding
        disableGap
        collapseHeaderProps={{
          paddingY: gutters(0.5),
          paddingX: gutters(0.8),
        }}
        header={
          <Gutters row disableGap disablePadding sx={{ position: 'relative' }}>
            {pendingInvitationsCount > 0 && (
              <BadgeCounter
                count={pendingInvitationsCount}
                size="small"
                aria-label={`${pendingInvitationsCount} pending invitations`}
                sx={{ position: 'absolute' }}
              />
            )}
            <MenuIcon fontSize="small" sx={{ color: 'neutral.light' }} />
            <Caption paddingLeft={gutters()}>{t('common.menu')}</Caption>
          </Gutters>
        }
      >
        {renderList()}
      </PageContentBlockCollapsible>
    );
  }

  return <PageContentBlock disablePadding>{renderList()}</PageContentBlock>;
};
