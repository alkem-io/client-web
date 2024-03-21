import {
  Box,
  BoxProps,
  ButtonProps,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  styled,
} from '@mui/material';
import MeetingRoom from '@mui/icons-material/MeetingRoom';
import Person from '@mui/icons-material/Person';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React, { ComponentType, ElementType, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '../../../core/routing/useNavigate';
import { buildUserProfileUrl } from '../../routing/urlBuilders';
import AlkemioAvatar from '../../../core/ui/image/AlkemioAvatar';
import UserSegmentAvatar from '../../../domain/community/user/userSegmentAvatar/UserSegmentAvatar';
import { UserMetadata } from '../../../domain/community/user/hooks/useUserMetadataWrapper';
import { BlockTitle, Caption } from '../../../core/ui/typography';
import { gutters } from '../../../core/ui/grid/utils';
import { AUTH_LOGOUT_PATH } from '../../../core/auth/authentication/constants/authentication.constants';
import PendingMembershipsUserMenuItem from '../../../domain/community/pendingMembership/PendingMembershipsUserMenuItem';
import { HdrStrongOutlined } from '@mui/icons-material';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';

const PREFIX = 'UserSegment';

const classes = {
  userHeader: `${PREFIX}-userHeader`,
};

const PopoverRoot = styled('div')(({ theme }) => ({
  [`& .${classes.userHeader}`]: {
    background: theme.palette.neutralLight.main,
    padding: theme.spacing(2, 4, 1),
  },
}));

type UserSegmentProps<El extends ElementType> = BoxProps<El> & {
  userMetadata: UserMetadata;
  emailVerified: boolean;
  buttonComponent: ComponentType<ButtonProps>;
};

const UserSegment = <El extends ElementType>({
  userMetadata,
  emailVerified,
  buttonComponent,
  ...userBoxProps
}: UserSegmentProps<El>) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, hasPlatformPrivilege } = userMetadata;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const popoverAnchor = useRef<HTMLButtonElement>(null);

  const isAdmin = hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin);

  const role = useMemo(() => {
    if (!emailVerified) return 'Not verified';
    if (isAdmin) {
      // TODO change role name path
      return t('common.enums.authorization-credentials.GLOBAL_ADMIN.name');
    }
  }, [emailVerified, isAdmin]);

  if (!user) {
    return null;
  }

  return (
    <>
      <UserSegmentAvatar
        name={user.firstName}
        src={user.profile.avatar?.uri}
        ref={popoverAnchor}
        buttonComponent={buttonComponent}
        onClick={() => setDropdownOpen(true)}
        {...userBoxProps}
      />
      <Popover
        open={dropdownOpen}
        anchorEl={popoverAnchor.current}
        onClose={() => setDropdownOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        keepMounted
      >
        <PopoverRoot>
          <Box display="flex" flexDirection={'column'} maxWidth={280}>
            <Box display="flex" flexDirection="column" alignItems="center" className={classes.userHeader}>
              <AlkemioAvatar size={'lg'} src={user.profile.avatar?.uri} />
              <BlockTitle lineHeight={gutters(2)}>{user.profile.displayName}</BlockTitle>
              {role && (
                <Caption color="neutralMedium.main" paddingBottom={gutters(0.5)}>
                  {role}
                </Caption>
              )}
            </Box>
            <List>
              <ListItemButton
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(buildUserProfileUrl(user.nameID), { replace: true });
                }}
              >
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary={t('buttons.my-profile')} />
              </ListItemButton>
              <PendingMembershipsUserMenuItem>
                {({ header, openDialog }) => (
                  <ListItemButton
                    onClick={() => {
                      openDialog();
                      setDropdownOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      <HdrStrongOutlined />
                    </ListItemIcon>
                    <ListItemText primary={header} />
                  </ListItemButton>
                )}
              </PendingMembershipsUserMenuItem>
              {isAdmin && (
                <ListItemButton
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/admin');
                  }}
                >
                  <ListItemIcon>
                    <SettingsOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('common.admin')} />
                </ListItemButton>
              )}
              <ListItemButton
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(AUTH_LOGOUT_PATH, { replace: true });
                }}
              >
                <ListItemIcon>
                  <MeetingRoom />
                </ListItemIcon>
                <ListItemText primary={t('buttons.sign-out')} />
              </ListItemButton>
            </List>
          </Box>
        </PopoverRoot>
      </Popover>
    </>
  );
};

export default UserSegment;
