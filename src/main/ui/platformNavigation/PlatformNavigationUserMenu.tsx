import {
  AssignmentIndOutlined,
  DashboardOutlined,
  ExitToAppOutlined,
  HdrStrongOutlined,
  LanguageOutlined,
  MeetingRoomOutlined,
} from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { Box, Divider, Menu, MenuItem, MenuList, Typography } from '@mui/material';
import FocusTrap from '@mui/material/Unstable_TrapFocus';
import { type PropsWithChildren, type ReactNode, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Avatar from '@/core/ui/avatar/Avatar';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import useLanguageSelect from '@/core/ui/language/useLanguageSelect';
import GlobalMenuSurface from '@/core/ui/menu/GlobalMenuSurface';
import NavigatableMenuItem from '@/core/ui/menu/NavigatableMenuItem';
import { BlockTitle, Caption } from '@/core/ui/typography';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { usePendingInvitationsCount } from '@/domain/community/pendingMembership/usePendingInvitationsCount';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { ROUTE_HOME, ROUTE_USER_ME } from '@/domain/platform/routes/constants';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { buildLoginUrl, buildUserAccountUrl } from '@/main/routing/urlBuilders';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from './constants';

const PendingMembershipsDialog = lazyWithGlobalErrorHandler(
  () => import('@/domain/community/pendingMembership/PendingMembershipsDialog')
);
const HelpDialog = lazyWithGlobalErrorHandler(() => import('@/core/help/dialog/HelpDialog'));

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

  const {
    openSelect,
    isOpen: isLanguageMenuOpen,
    menuProps: languageMenuProps,
    languages,
  } = useLanguageSelect({
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    zIndex: PLATFORM_NAVIGATION_MENU_Z_INDEX + 1,
  });

  // the roles should follow the order
  const getRole = (): string | null => {
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
      }
    }
    return null;
  };
  const role = getRole();

  const Wrapper = surface ? GlobalMenuSurface : Box;

  return (
    <>
      <Wrapper ref={ref}>
        {userModel && (
          <Gutters disableGap={true} alignItems="center" sx={{ paddingBottom: 1 }}>
            <Avatar
              size="large"
              src={userModel.profile?.avatar?.uri}
              alt={
                userModel.profile?.displayName
                  ? t('common.avatar-of', { user: userModel.profile?.displayName })
                  : t('common.avatar')
              }
            />
            <BlockTitle lineHeight={gutters(2)}>{userModel.profile?.displayName}</BlockTitle>
            {role && (
              <Caption color="neutralMedium.main" textTransform="uppercase">
                {role}
              </Caption>
            )}
          </Gutters>
        )}
        <FocusTrap open={true}>
          <MenuList autoFocus={true} disablePadding={true} sx={{ paddingY: 1, outline: 'none' }}>
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
              <NavigatableMenuItem iconComponent={AssignmentIndOutlined} route={ROUTE_USER_ME} onClick={onClose}>
                {t('pages.user-profile.title')}
              </NavigatableMenuItem>
            )}
            {userModel && (
              <NavigatableMenuItem
                iconComponent={LocalOfferOutlinedIcon}
                route={buildUserAccountUrl(ROUTE_USER_ME)}
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
            <NavigatableMenuItem
              id="language-button"
              iconComponent={LanguageOutlined}
              onClick={event => openSelect(event.currentTarget as HTMLElement)}
              aria-controls={isLanguageMenuOpen ? 'language-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isLanguageMenuOpen ? 'true' : undefined}
            >
              {t('buttons.changeLanguage')}
            </NavigatableMenuItem>
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
            <NavigatableMenuItem tabOnly={true} iconComponent={ExitToAppOutlined} onClick={onClose}>
              {t('components.navigation.exitMenu')}
            </NavigatableMenuItem>
            {footer}
          </MenuList>
        </FocusTrap>
      </Wrapper>
      {userModel && (
        <Suspense fallback={null}>
          <PendingMembershipsDialog />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <HelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
      </Suspense>
      <Menu {...languageMenuProps}>
        {languages.map(lng => (
          <MenuItem key={lng.key} selected={lng.selected} onClick={lng.onClick}>
            <Caption lang={lng.lang}>{lng.label}</Caption>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default PlatformNavigationUserMenu;
