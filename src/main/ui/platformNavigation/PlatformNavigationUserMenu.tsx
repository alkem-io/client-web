import React, { forwardRef, PropsWithChildren, useMemo, useState } from 'react';
import { Box, Divider, MenuList, Typography } from '@mui/material';
import Avatar from '../../../core/ui/image/Avatar';
import { BlockTitle, Caption } from '../../../core/ui/typography';
import { gutters } from '../../../core/ui/grid/utils';
import { buildLoginUrl, buildUserProfileUrl } from '../../routing/urlBuilders';
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
import LanguageSelect from '../../../core/ui/language/LanguageSelect';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpDialog from '../../../core/help/dialog/HelpDialog';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import { useLocation } from 'react-router-dom';
import NavigatableMenuItem from '../../../core/ui/menu/NavigatableMenuItem';
import GlobalMenuSurface from '../../../core/ui/menu/GlobalMenuSurface';

interface PlatformNavigationUserMenuProps {
  surface: boolean;
  onClose?: () => void;
}

const PlatformNavigationUserMenu = forwardRef<HTMLDivElement, PropsWithChildren<PlatformNavigationUserMenuProps>>(
  ({ surface, onClose, children }, ref) => {
    const { t } = useTranslation();

    const { pathname } = useLocation();

    const { user: { user, hasPlatformPrivilege } = {}, isAuthenticated } = useUserContext();

    const isAdmin = hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);

    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

    const role = useMemo(() => {
      if (isAdmin) {
        // TODO change role name path
        return t('common.enums.authorization-credentials.GLOBAL_ADMIN.name');
      }
    }, [isAdmin, t]);

    const Wrapper = surface ? GlobalMenuSurface : Box;

    return (
      <>
        <Wrapper ref={ref}>
          {user && (
            <Gutters disableGap alignItems="center" sx={{ paddingBottom: 1 }}>
              <Avatar size="lg" src={user.profile.visual?.uri} />
              <BlockTitle lineHeight={gutters(2)}>{user.profile.displayName}</BlockTitle>
              {role && (
                <Caption color="neutralMedium.main" textTransform="uppercase">
                  {role}
                </Caption>
              )}
            </Gutters>
          )}
          <MenuList disablePadding sx={{ paddingY: 1 }}>
            {!isAuthenticated && (
              <NavigatableMenuItem
                iconComponent={MeetingRoomOutlined}
                route={buildLoginUrl(pathname)}
                onClick={onClose}
              >
                <Typography variant="inherit" fontWeight="bold">
                  {t('topbar.sign-in')}
                </Typography>
              </NavigatableMenuItem>
            )}
            <NavigatableMenuItem iconComponent={DashboardOutlined} route={ROUTE_HOME} onClick={onClose}>
              {t('pages.home.title')}
            </NavigatableMenuItem>
            {user && (
              <NavigatableMenuItem
                iconComponent={AssignmentIndOutlined}
                route={buildUserProfileUrl(user.nameID)}
                onClick={onClose}
              >
                {t('pages.user-profile.title')}
              </NavigatableMenuItem>
            )}
            {user && (
              <PendingMembershipsUserMenuItem>
                {({ header, openDialog }) => (
                  <NavigatableMenuItem
                    iconComponent={HdrStrongOutlined}
                    onClick={() => {
                      openDialog();
                      onClose?.();
                    }}
                  >
                    {header}
                  </NavigatableMenuItem>
                )}
              </PendingMembershipsUserMenuItem>
            )}
            <Divider sx={{ width: '85%', marginX: 'auto' }} />
            {children}
            {children && <Divider sx={{ width: '85%', marginX: 'auto' }} />}
            {isAdmin && (
              <NavigatableMenuItem iconComponent={SettingsIcon} route="/admin" onClick={onClose}>
                {t('common.administration')}
              </NavigatableMenuItem>
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
                <NavigatableMenuItem
                  iconComponent={LanguageOutlined}
                  onClick={event => openSelect(event.currentTarget as HTMLElement)}
                >
                  {t('buttons.changeLanguage')}
                </NavigatableMenuItem>
              )}
            </LanguageSelect>
            <NavigatableMenuItem
              iconComponent={HelpOutlineIcon}
              onClick={() => {
                setIsHelpDialogOpen(true);
                onClose?.();
              }}
            >
              {t('buttons.getHelp')}
            </NavigatableMenuItem>
            {isAuthenticated && (
              <NavigatableMenuItem iconComponent={MeetingRoomOutlined} route={AUTH_LOGOUT_PATH} onClick={onClose}>
                {t('buttons.sign-out')}
              </NavigatableMenuItem>
            )}
          </MenuList>
        </Wrapper>
        <HelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
      </>
    );
  }
);

export default PlatformNavigationUserMenu;
