import { forwardRef, PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import { Box, Divider, MenuList, Typography } from '@mui/material';
import AlkemioAvatar from '@/core/ui/image/AlkemioAvatar';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { buildLoginUrl, buildUserProfileUrl } from '@/main/routing/urlBuilders';
import PendingMembershipsUserMenuItem from '@/domain/community/pendingMembership/PendingMembershipsUserMenuItem';
import {
  AssignmentIndOutlined,
  DashboardOutlined,
  ExitToAppOutlined,
  HdrStrongOutlined,
  LanguageOutlined,
  MeetingRoomOutlined,
} from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useTranslation } from 'react-i18next';
import { AuthorizationPrivilege, PlatformRole } from '@/core/apollo/generated/graphql-schema';
import { useUserContext } from '@/domain/community/user';
import Gutters from '@/core/ui/grid/Gutters';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import LanguageSelect from '@/core/ui/language/LanguageSelect';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpDialog from '@/core/help/dialog/HelpDialog';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import { useLocation } from 'react-router-dom';
import NavigatableMenuItem from '@/core/ui/menu/NavigatableMenuItem';
import GlobalMenuSurface from '@/core/ui/menu/GlobalMenuSurface';
import { FocusTrap } from '@mui/base/FocusTrap';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';

interface PlatformNavigationUserMenuProps {
  surface: boolean;
  footer?: ReactNode;
  onClose?: () => void;
}

export const UserMenuDivider = () => <Divider sx={{ width: '85%', marginX: 'auto' }} />;

const PlatformNavigationUserMenu = forwardRef<HTMLDivElement, PropsWithChildren<PlatformNavigationUserMenuProps>>(
  ({ surface, onClose, footer, children }, ref) => {
    const { t } = useTranslation();

    const { pathname } = useLocation();

    const platformOrigin = usePlatformOrigin();
    const homeUrl = platformOrigin && `${platformOrigin}${ROUTE_HOME}`;

    const { user: { user, hasPlatformPrivilege } = {}, isAuthenticated, platformRoles } = useUserContext();

    // todo: change with PlatformRole.GlobalAdmin?
    const isAdmin = hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);

    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

    // the roles should follow the order
    const role = useMemo(() => {
      for (const platformRole of platformRoles) {
        switch (platformRole) {
          case PlatformRole.GlobalAdmin:
            return t('common.roles.GLOBAL_ADMIN');
          case PlatformRole.Support:
            return t('common.roles.SUPPORT');
          case PlatformRole.LicenseManager:
            return t('common.roles.LICENSE_MANAGER');
          case PlatformRole.BetaTester:
            return t('common.roles.BETA_TESTER');
          case PlatformRole.VcCampaign:
            return t('common.roles.VC_CAMPAIGN');
          default:
            return null;
        }
      }
    }, [platformRoles, t]);

    const Wrapper = surface ? GlobalMenuSurface : Box;

    return (
      <>
        <Wrapper ref={ref}>
          {user && (
            <Gutters disableGap alignItems="center" sx={{ paddingBottom: 1 }}>
              <AlkemioAvatar size="lg" src={user.profile.avatar?.uri} />
              <BlockTitle lineHeight={gutters(2)}>{user.profile.displayName}</BlockTitle>
              {role && (
                <Caption color="neutralMedium.main" textTransform="uppercase">
                  {role}
                </Caption>
              )}
            </Gutters>
          )}
          <FocusTrap open>
            <MenuList autoFocus disablePadding sx={{ paddingY: 1 }}>
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
              <NavigatableMenuItem iconComponent={DashboardOutlined} route={homeUrl} onClick={onClose}>
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
              <UserMenuDivider />
              {children}
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
              <NavigatableMenuItem tabOnly iconComponent={ExitToAppOutlined} onClick={onClose}>
                {t('components.navigation.exitMenu')}
              </NavigatableMenuItem>
              {footer}
            </MenuList>
          </FocusTrap>
        </Wrapper>
        <HelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
      </>
    );
  }
);

export default PlatformNavigationUserMenu;
