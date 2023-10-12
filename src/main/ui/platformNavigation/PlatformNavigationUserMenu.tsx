import React, { ComponentType, forwardRef, MouseEventHandler, PropsWithChildren, useMemo, useState } from 'react';
import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, SvgIconProps } from '@mui/material';
import Avatar from '../../../core/ui/image/Avatar';
import { BlockSectionTitle, BlockTitle, Caption } from '../../../core/ui/typography';
import { gutters } from '../../../core/ui/grid/utils';
import { buildUserProfileUrl } from '../../routing/urlBuilders';
import PendingMembershipsUserMenuItem from '../../../domain/community/pendingMembership/PendingMembershipsUserMenuItem';
import {
  AssignmentIndOutlined,
  DashboardOutlined,
  HdrStrongOutlined,
  LanguageOutlined,
  MeetingRoomOutlined,
} from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { AUTH_LOGOUT_PATH } from '../../../core/auth/authentication/constants/authentication.constants';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';
import { useUserContext } from '../../../domain/community/user';
import Gutters from '../../../core/ui/grid/Gutters';
import { ROUTE_HOME } from '../../../domain/platform/routes/constants';
import RouterLink from '../../../core/ui/link/RouterLink';
import LanguageSelect from '../../../core/ui/language/LanguageSelect';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpDialog from '../../../core/help/dialog/HelpDialog';
import { PLATFORM_NAVIGATION_MENU_ELEVATION, PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';

interface PlatformNavigationUserMenuProps {
  onClose?: () => void;
}

interface PlatformNavigationUserMenuItemProps {
  iconComponent: ComponentType<SvgIconProps>;
  route?: string;
  onClick?: MouseEventHandler;
}

const PlatformNavigationUserMenuItem = ({
  iconComponent: Icon,
  route,
  onClick,
  children,
}: PropsWithChildren<PlatformNavigationUserMenuItemProps>) => {
  const menuItemProps = route ? { component: RouterLink, to: route } : {};

  return (
    <MenuItem {...menuItemProps} onClick={onClick} sx={{ paddingX: gutters() }}>
      <ListItemIcon>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText disableTypography>
        <BlockSectionTitle textTransform="uppercase">{children}</BlockSectionTitle>
      </ListItemText>
    </MenuItem>
  );
};

const PlatformNavigationUserMenu = forwardRef<HTMLDivElement, PlatformNavigationUserMenuProps>(({ onClose }, ref) => {
  const { t } = useTranslation();

  const { user: { user, hasPlatformPrivilege } = {} } = useUserContext();

  const isAdmin = hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);

  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const role = useMemo(() => {
    if (isAdmin) {
      // TODO change role name path
      return t('common.enums.authorization-credentials.GLOBAL_ADMIN.name');
    }
  }, [isAdmin, t]);

  return (
    <>
      <Paper ref={ref} sx={{ width: 320, maxWidth: '100%' }} elevation={PLATFORM_NAVIGATION_MENU_ELEVATION}>
        {user && (
          <Gutters disableGap alignItems="center">
            <Avatar size="lg" src={user.profile.visual?.uri} />
            <BlockTitle lineHeight={gutters(2)}>{user.profile.displayName}</BlockTitle>
            {role && (
              <Caption color="neutralMedium.main" textTransform="uppercase">
                {role}
              </Caption>
            )}
          </Gutters>
        )}
        <MenuList disablePadding sx={{ paddingBottom: 1 }}>
          <PlatformNavigationUserMenuItem iconComponent={DashboardOutlined} route={ROUTE_HOME} onClick={onClose}>
            {t('pages.home.title')}
          </PlatformNavigationUserMenuItem>
          {user && (
            <PlatformNavigationUserMenuItem
              iconComponent={AssignmentIndOutlined}
              route={buildUserProfileUrl(user.id)}
              onClick={onClose}
            >
              {t('pages.user-profile.title')}
            </PlatformNavigationUserMenuItem>
          )}
          <PendingMembershipsUserMenuItem>
            {({ header, openDialog }) => (
              <PlatformNavigationUserMenuItem
                iconComponent={HdrStrongOutlined}
                onClick={() => {
                  openDialog();
                  onClose?.();
                }}
              >
                {header}
              </PlatformNavigationUserMenuItem>
            )}
          </PendingMembershipsUserMenuItem>
          <Divider sx={{ width: '85%', marginX: 'auto' }} />
          {isAdmin && (
            <PlatformNavigationUserMenuItem iconComponent={SettingsIcon} route="/admin" onClick={onClose}>
              {t('common.administration')}
            </PlatformNavigationUserMenuItem>
          )}
          <LanguageSelect
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            zIndex={PLATFORM_NAVIGATION_MENU_Z_INDEX + 1}
          >
            {({ openSelect }) => (
              <PlatformNavigationUserMenuItem
                iconComponent={LanguageOutlined}
                onClick={event => openSelect(event.currentTarget as HTMLElement)}
              >
                {t('buttons.changeLanguage')}
              </PlatformNavigationUserMenuItem>
            )}
          </LanguageSelect>
          <PlatformNavigationUserMenuItem
            iconComponent={HelpOutlineIcon}
            onClick={() => {
              setIsHelpDialogOpen(true);
              onClose?.();
            }}
          >
            {t('buttons.getHelp')}
          </PlatformNavigationUserMenuItem>
          <PlatformNavigationUserMenuItem
            iconComponent={MeetingRoomOutlined}
            route={AUTH_LOGOUT_PATH}
            onClick={onClose}
          >
            {t('buttons.sign-out')}
          </PlatformNavigationUserMenuItem>
        </MenuList>
      </Paper>
      <HelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
    </>
  );
});

export default PlatformNavigationUserMenu;
