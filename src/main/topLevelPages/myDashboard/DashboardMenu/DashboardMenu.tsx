import React from 'react';
import { Divider, FormControlLabel, List, ListItem, ListItemButton, Switch } from '@mui/material';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { DashboardMenuProps, MenuOptionProps } from './dashboardMenuTypes';
import { useDashboardContext } from '../DashboardContext';
import { Caption } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import TranslationKey from '../../../../core/i18n/utils/TranslationKey';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { useHomeMenuItems } from './useHomeMenuItems';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '../../../../domain/community/pendingMembership/PendingMembershipsDialogContext';

export const DashboardMenu = ({ compact = false }: DashboardMenuProps) => {
  const { t } = useTranslation();
  const { activityEnabled, setActivityEnabled, setOpenedDialog } = useDashboardContext();
  const { items, loading: itemsConfigLoading } = useHomeMenuItems();
  const { setOpenDialog } = usePendingMembershipsDialog();

  const changeView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActivityEnabled(event.target.checked);
  };

  const getTranslationByKey = (key: string) => t(`${key}` as TranslationKey, { defaultValue: key });

  const openDialog = (dialog: DashboardDialog | undefined) => () => setOpenedDialog(dialog);

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
          </ListItemButton>
        );
      case 'link':
        return (
          <ListItemButton key={index} component={RouterLink} to={item.to ?? ''} sx={{ paddingY: gutters(0.75) }}>
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

  return (
    <PageContentBlock disablePadding>
      <List disablePadding>
        {items
          .filter(item => item.isVisible(activityEnabled, compact))
          .map((item, index) => renderMenuItem(item, index))}
      </List>
    </PageContentBlock>
  );
};
