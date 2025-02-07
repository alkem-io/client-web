import React from 'react';
import { Box, Divider, FormControlLabel, List, ListItem, ListItemButton, Switch } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { DashboardMenuProps, MenuOptionProps } from './dashboardMenuTypes';
import { useDashboardContext } from '../DashboardContext';
import { Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import RouterLink from '@/core/ui/link/RouterLink';
import { useHomeMenuItems } from './useHomeMenuItems';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import BadgeCounter from '@/core/ui/icon/BadgeCounter';
import PageContentBlockCollapsible from '@/core/ui/content/PageContentBlockCollapsible';
import { Menu as MenuIcon } from '@mui/icons-material';
import Gutters from '@/core/ui/grid/Gutters';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';

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

  const changeView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActivityEnabled(event.target.checked);
  };

  const getTranslationByKey = (key: string) => t(`${key}` as TranslationKey, { defaultValue: key });

  const openDialog = (dialog: DashboardDialog | undefined) => () => setIsOpen(dialog);

  const getItemContent = (item: MenuOptionProps) => (
    <>
      {item.icon && <item.icon fontSize="small" sx={{ color: 'neutral.light' }} />}
      <Caption paddingLeft={gutters()}>{getTranslationByKey(item.label)}</Caption>
    </>
  );

  const renderMenuItem = (item: MenuOptionProps, index: number) => {
    switch (item.type) {
      case 'invites':
        return (
          <ListItemButton
            key={index}
            sx={{ paddingY: gutters(0.75) }}
            onClick={() => setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList })}
          >
            {getItemContent(item)}
            {pendingInvitationsCount > 0 && (
              <>
                <Box sx={{ flexGrow: 1 }} />
                <BadgeCounter count={pendingInvitationsCount} size="small" />
              </>
            )}
          </ListItemButton>
        );
      case 'link':
        return (
          <ListItemButton
            key={index}
            component={RouterLink}
            to={item.to ?? ''}
            disabled={!item.to}
            sx={{ paddingY: gutters(0.75) }}
          >
            {getItemContent(item)}
          </ListItemButton>
        );
      case 'dialog':
        return (
          <ListItemButton key={index} sx={{ paddingY: gutters(0.75) }} onClick={openDialog(item.dialog)}>
            {getItemContent(item)}
          </ListItemButton>
        );
      case 'switch':
        return (
          <ListItem key={index} sx={{ paddingY: gutters(0.75) }}>
            <FormControlLabel
              key={index}
              label={<Caption paddingLeft={gutters(0.5)}>{getTranslationByKey(item.label)}</Caption>}
              control={<Switch size="small" name="view" checked={activityEnabled} onChange={changeView} />}
            />
          </ListItem>
        );
      case 'divider':
        return <Divider key={index} />;
      default:
        return null;
    }
  };

  if (itemsConfigLoading) {
    return null;
  }

  const renderContent = () => (
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
              <BadgeCounter count={pendingInvitationsCount} size="small" sx={{ position: 'absolute' }} />
            )}
            <MenuIcon fontSize="small" sx={{ color: 'neutral.light' }} />
            <Caption paddingLeft={gutters()}>{t('common.menu')}</Caption>
          </Gutters>
        }
      >
        {renderContent()}
      </PageContentBlockCollapsible>
    );
  }

  return <PageContentBlock disablePadding>{renderContent()}</PageContentBlock>;
};
