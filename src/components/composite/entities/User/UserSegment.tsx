import { Box, Popover, styled } from '@mui/material';
import { ReactComponent as DoorOpenIcon } from 'bootstrap-icons/icons/door-open.svg';
import { ReactComponent as PersonFill } from 'bootstrap-icons/icons/person-fill.svg';
import React, { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserMetadata } from '../../../../hooks';
import { buildUserProfileUrl } from '../../../../utils/urlBuilders';
import Avatar from '../../../core/Avatar';
import Button from '../../../core/Button';
import Icon from '../../../core/Icon';
import Typography from '../../../core/Typography';
import User from './User';

const PREFIX = 'UserSegment';

const classes = {
  userHeader: `${PREFIX}-userHeader`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.userHeader}`]: {
    background: theme.palette.neutralLight.main,
    padding: theme.spacing(2, 4),
  },
}));

interface UserSegmentProps {
  userMetadata: UserMetadata;
  emailVerified: boolean;
}

const UserSegment: FC<UserSegmentProps> = ({ userMetadata, emailVerified }) => {
  const { t } = useTranslation();
  const { user, roles } = userMetadata;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const popoverAnchor = useRef(null);

  const role = useMemo(() => {
    if (!emailVerified) return 'Not verified';
    return roles.filter(r => !r.hidden)[0]?.name;
  }, [userMetadata]);

  if (!user) {
    return null;
  }

  return (
    <>
      <User
        name={user.displayName}
        title={role}
        src={user.profile?.avatar}
        ref={popoverAnchor as any}
        onClick={() => setDropdownOpen(true)}
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
        <Root>
          <Box display="flex" flexDirection={'column'} maxWidth={280}>
            <Box display="flex" flexDirection="column" alignItems="center" className={classes.userHeader}>
              <Avatar size={'lg'} src={user.profile?.avatar} />
              <Box textAlign={'center'}>
                <Typography variant="h3">{user.displayName}</Typography>
              </Box>
              <Typography variant="h5" color="neutralMedium">
                {role}
              </Typography>
            </Box>
            <Box display="flex" textAlign="center">
              <Button
                as={Link}
                to={buildUserProfileUrl(user.nameID)}
                onClick={() => {
                  setDropdownOpen(false);
                }}
                variant="transparent"
                inset
                block
                small
                text={t('buttons.my-profile')}
                startIcon={<Icon component={PersonFill} color="inherit" size="sm" />}
              />
            </Box>
            <Box display="flex" textAlign="center">
              <Button
                as={Link}
                to={'/identity/logout'}
                onClick={() => {
                  setDropdownOpen(false);
                }}
                variant="transparent"
                inset
                block
                small
                text={t('buttons.sign-out')}
                startIcon={<Icon component={DoorOpenIcon} color="inherit" size="sm" />}
              />
            </Box>
          </Box>
        </Root>
      </Popover>
    </>
  );
};

export default UserSegment;
