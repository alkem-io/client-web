import React, { useMemo } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import Avatar from '../../../core/ui/image/Avatar';
import { BlockTitle, Caption } from '../../../core/ui/typography';
import { gutters } from '../../../core/ui/grid/utils';
import { buildUserProfileUrl } from '../../routing/urlBuilders';
import Person from '@mui/icons-material/Person';
import PendingMembershipsUserMenuItem from '../../../domain/community/pendingMembership/PendingMembershipsUserMenuItem';
import { HdrStrongOutlined } from '@mui/icons-material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { AUTH_LOGOUT_PATH } from '../../../core/auth/authentication/constants/authentication.constants';
import MeetingRoom from '@mui/icons-material/MeetingRoom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';
import { useUserContext } from '../../../domain/community/user';
import Gutters from '../../../core/ui/grid/Gutters';

interface PlatformNavigationUserMenuProps {
  onClose?: () => void;
}

/**
 * This one is taken from old UserSegment
 * TODO refactor
 * @constructor
 */
const PlatformNavigationUserMenu = ({ onClose }: PlatformNavigationUserMenuProps) => {
  const { user: userMetadata } = useUserContext();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, hasPlatformPrivilege } = userMetadata ?? {};

  const isAdmin = hasPlatformPrivilege?.(AuthorizationPrivilege.PlatformAdmin);

  const role = useMemo(() => {
    if (isAdmin) {
      // TODO change role name path
      return t('common.enums.authorization-credentials.GLOBAL_ADMIN.name');
    }
  }, [isAdmin]);

  if (!user) {
    return null;
  }

  return (
    <Paper sx={{ maxWidth: gutters(14) }}>
      <Gutters alignItems="center">
        <Avatar size={'lg'} src={user.profile.visual?.uri} />
        <BlockTitle lineHeight={gutters(2)}>{user.profile.displayName}</BlockTitle>
        {role && (
          <Caption color="neutralMedium.main" paddingBottom={gutters(0.5)}>
            {role}
          </Caption>
        )}
      </Gutters>
      <List>
        <ListItemButton
          onClick={() => {
            onClose?.();
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
                onClose?.();
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
              onClose?.();
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
            onClose?.();
            navigate(AUTH_LOGOUT_PATH, { replace: true });
          }}
        >
          <ListItemIcon>
            <MeetingRoom />
          </ListItemIcon>
          <ListItemText primary={t('buttons.sign-out')} />
        </ListItemButton>
      </List>
    </Paper>
  );
};

export default PlatformNavigationUserMenu;
