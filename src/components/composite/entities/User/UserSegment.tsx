import { Box, BoxProps, List, ListItemButton, ListItemIcon, ListItemText, Popover, styled } from '@mui/material';
import MeetingRoom from '@mui/icons-material/MeetingRoom';
import Person from '@mui/icons-material/Person';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import React, { ElementType, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserMetadata } from '../../../../hooks';
import { buildUserProfileUrl } from '../../../../utils/urlBuilders';
import Avatar from '../../../core/Avatar';
import Typography from '../../../core/Typography';
import UserAvatar from './UserAvatar';

const PREFIX = 'UserSegment';

const classes = {
  userHeader: `${PREFIX}-userHeader`,
};

const PopoverRoot = styled('div')(({ theme }) => ({
  [`& .${classes.userHeader}`]: {
    background: theme.palette.neutralLight.main,
    padding: theme.spacing(2, 4),
  },
}));

type UserSegmentProps<El extends ElementType> = BoxProps<El> & {
  userMetadata: UserMetadata;
  emailVerified: boolean;
  buttonClassName?: string;
};

const UserSegment = <El extends ElementType>({
  userMetadata,
  emailVerified,
  buttonClassName,
  ...userBoxProps
}: UserSegmentProps<El>) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, roles } = userMetadata;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const popoverAnchor = useRef<HTMLButtonElement>(null);

  const role = useMemo(() => {
    if (!emailVerified) return 'Not verified';
    return roles.filter(r => !r.hidden)[0]?.name;
  }, [userMetadata]);

  if (!user) {
    return null;
  }

  return (
    <>
      <UserAvatar
        name={user.firstName}
        src={user.profile?.avatar?.uri}
        ref={popoverAnchor}
        className={buttonClassName}
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
      >
        <PopoverRoot>
          <Box display="flex" flexDirection={'column'} maxWidth={280}>
            <Box display="flex" flexDirection="column" alignItems="center" className={classes.userHeader}>
              <Avatar size={'lg'} src={user.profile?.avatar?.uri} />
              <Box textAlign={'center'}>
                <Typography variant="h3">{user.displayName}</Typography>
              </Box>
              <Typography variant="h5" color="neutralMedium">
                {role}
              </Typography>
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
              <ListItemButton
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/admin', { replace: true });
                }}
              >
                <ListItemIcon>
                  <SettingsOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t('common.admin')} />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/identity/logout', { replace: true });
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
