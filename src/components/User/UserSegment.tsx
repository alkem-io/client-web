import React, { FC, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Popover } from '@material-ui/core';
import { createStyles } from '../../hooks/useTheme';
import { UserMetadata } from '../../hooks';
import { ReactComponent as PersonFill } from 'bootstrap-icons/icons/person-fill.svg';
import { ReactComponent as DoorOpenIcon } from 'bootstrap-icons/icons/door-open.svg';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import User from './User';
import Button from '../core/Button';
import Icon from '../core/Icon';

const useStyles = createStyles(theme => ({
  popover: {
    padding: 0,
  },
  userHeader: {
    background: theme.palette.neutralLight.main,
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
  },
}));

interface UserSegmentProps {
  orientation: 'vertical' | 'horizontal';
  userMetadata: UserMetadata;
  emailVerified: boolean;
}

const UserSegment: FC<UserSegmentProps> = ({ orientation, userMetadata, emailVerified }) => {
  const { t } = useTranslation();
  const { user, roles } = userMetadata;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const popoverAnchor = useRef(null);
  const styles = useStyles();
  const history = useHistory();

  const role = useMemo(() => {
    if (!emailVerified) return 'Not verified';
    return roles.filter(r => !r.hidden)[0]?.name;
  }, [userMetadata]);

  return (
    user && (
      <>
        <User
          name={user.displayName}
          title={role}
          orientation={orientation}
          src={user.profile?.avatar}
          ref={popoverAnchor as any}
          onClick={() => setDropdownOpen(true)}
          reverseLayout
        />
        <Popover
          open={dropdownOpen}
          anchorEl={popoverAnchor.current}
          onClose={() => setDropdownOpen(false)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box display="flex" flexDirection={'column'} maxWidth={280}>
            <Box display="flex" flexDirection="column" alignItems="center" className={styles.userHeader}>
              <Avatar size={'lg'} src={user.profile?.avatar} />
              <Box textAlign={'center'}>
                <Typography variant="h3">{user.displayName}</Typography>
              </Box>
              <Typography variant="h5" color="neutralMedium">
                {role}
              </Typography>
            </Box>
            <Box display="flex">
              <Button
                onClick={() => {
                  setDropdownOpen(false);
                  history.push('/profile');
                }}
                variant="transparent"
                inset
                block
                small
                text={t('buttons.my-profile')}
                startIcon={<Icon component={PersonFill} color="inherit" size="sm" />}
              />
            </Box>
            <Box>
              <Button
                onClick={() => {
                  setDropdownOpen(false);
                  history.push('/identity/logout');
                }}
                variant="transparent"
                inset
                block
                small
                startIcon={<Icon component={DoorOpenIcon} color="inherit" size="sm" />}
                text={t('buttons.sign-out')}
              />
            </Box>
          </Box>
        </Popover>
      </>
    )
  );
};

export default UserSegment;
