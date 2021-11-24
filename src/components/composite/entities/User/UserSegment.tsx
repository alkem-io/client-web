import { Box, Popover } from '@mui/material';
import { ReactComponent as DoorOpenIcon } from 'bootstrap-icons/icons/door-open.svg';
import { ReactComponent as PersonFill } from 'bootstrap-icons/icons/person-fill.svg';
import React, { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { UserMetadata } from '../../../../hooks';
import { makeStyles } from '@mui/styles';
import { buildUserProfileUrl } from '../../../../utils/urlBuilders';
import Avatar from '../../../core/Avatar';
import Button from '../../../core/Button';
import Icon from '../../../core/Icon';
import Typography from '../../../core/Typography';
import User from './User';

const useStyles = makeStyles(theme => ({
  popover: {
    padding: 0,
  },
  userHeader: {
    background: theme.palette.neutralLight.main,
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
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
        </Popover>
      </>
    )
  );
};

export default UserSegment;
