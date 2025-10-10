import { PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import { Box, Divider, MenuList, Typography } from '@mui/material';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import { buildLoginUrl, buildUserAccountUrl } from '@/main/routing/urlBuilders';
import PendingMembershipsDialog from '@/domain/community/pendingMembership/PendingMembershipsDialog';
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
import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import Gutters from '@/core/ui/grid/Gutters';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import LanguageSelect from '@/core/ui/language/LanguageSelect';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpDialog from '@/core/help/dialog/HelpDialog';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';
import { useLocation } from 'react-router-dom';
import NavigatableMenuItem from '@/core/ui/menu/NavigatableMenuItem';
import GlobalMenuSurface from '@/core/ui/menu/GlobalMenuSurface';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import Avatar from '@/core/ui/avatar/Avatar';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import FocusTrap from '@mui/material/Unstable_TrapFocus';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';

interface PlatformNavigationUserMenuProps {
  surface: boolean;
  footer?: ReactNode;
  onClose?: () => void;
}

export const UserMenuDivider = () => <Divider sx={{ width: '85%', marginX: 'auto' }} />;

const PlatformNavigationUserMenu = ({
  ref,
  surface,
  onClose,
  footer,
  children,
}: PropsWithChildren<PlatformNavigationUserMenuProps> & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const { t } = useTranslation();

  const { pathname, search } = useLocation();

  const platformOrigin = usePlatformOrigin();
  const homeUrl = platformOrigin && `${platformOrigin}${ROUTE_HOME}`;

  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const { setOpenDialog } = usePendingMembershipsDialog();

  const { userModel, platformPrivilegeWrapper: userWrapper, isAuthenticated, platformRoles } = useCurrentUserContext();

  const isAdmin = userWrapper?.hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);

  const { count: pendingInvitationsCount } = usePendingInvitationsCount();

  // the roles should follow the order
  const role = useMemo(() => {
    for (const platformRole of platformRoles) {
      switch (platformRole) {
        case RoleName.GlobalAdmin:
          return t('common.roles.GLOBAL_ADMIN');
        case RoleName.GlobalSupport:
          return t('common.roles.GLOBAL_SUPPORT');
        case RoleName.GlobalLicenseManager:
          return t('common.roles.GLOBAL_LICENSE_MANAGER');
        case RoleName.PlatformBetaTester:
          return t('common.roles.PLATFORM_BETA_TESTER');
        case RoleName.PlatformVcCampaign:
          return t('common.roles.PLATFORM_VC_CAMPAIGN');
        default:
          return null;
      }
    }
  }, [platformRoles, t]);

  const Wrapper = surface ? GlobalMenuSurface : Box;

  return (
    <>
      <Wrapper ref={ref}>
        {userModel && (
          <Gutters disableGap alignItems="center" sx={{ paddingBottom: 1 }}>
            <Avatar
              size="large"
              src={userModel.profile.avatar?.uri}
              alt={
                userModel.profile?.displayName
                  ? t('common.avatar-of', { user: userModel.profile?.displayName })
                  : t('common.avatar')
              }
            />
            <BlockTitle lineHeight={gutters(2)}>{userModel.profile.displayName}</BlockTitle>
            {role && (
              <Caption color="neutralMedium.main" textTransform="uppercase">
                {role}
              </Caption>
            )}
          </Gutters>
        )}
        <FocusTrap open>
          <MenuList autoFocus disablePadding sx={{ paddingY: 1, outline: 'none' }}>
            {!isAuthenticated && (
              <NavigatableMenuItem
                iconComponent={MeetingRoomOutlined}
                route={buildLoginUrl(pathname, search)}
                onClick={onClose}
              >
                <Typography variant="inherit" fontWeight="bold">
                  {t('topBar.sign-in')}
                </Typography>
              </NavigatableMenuItem>
            )}
            <NavigatableMenuItem iconComponent={DashboardOutlined} route={homeUrl} onClick={onClose}>
              {t('pages.home.title')}
            </NavigatableMenuItem>
            {userModel && (
              <NavigatableMenuItem
                iconComponent={AssignmentIndOutlined}
                route={userModel.profile.url}
                onClick={onClose}
              >
                {t('pages.user-profile.title')}
              </NavigatableMenuItem>
            )}
            {userModel && (
              <NavigatableMenuItem
                iconComponent={LocalOfferOutlinedIcon}
                route={buildUserAccountUrl(userModel.profile.url)}
                onClick={onClose}
              >
                {t('pages.home.mainNavigation.myAccount')}
              </NavigatableMenuItem>
            )}
            {userModel && (
              <NavigatableMenuItem
                iconComponent={HdrStrongOutlined}
                onClick={() => {
                  setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
                  onClose?.();
                }}
              >
                {t('community.pendingMembership.pendingMembershipsWithCount', { count: pendingInvitationsCount })}
              </NavigatableMenuItem>
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
              {({ openSelect, isOpen }) => (
                <NavigatableMenuItem
                  id="language-button"
                  iconComponent={LanguageOutlined}
                  onClick={event => openSelect(event.currentTarget as HTMLElement)}
                  aria-controls={isOpen ? 'language-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={isOpen ? 'true' : undefined}
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
      {userModel && <PendingMembershipsDialog />}
      <HelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
    </>
  );
};

export default PlatformNavigationUserMenu;
