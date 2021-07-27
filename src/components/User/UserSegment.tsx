import { Box } from '@material-ui/core';
import React, { FC, useMemo, useRef, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { createStyles } from '../../hooks/useTheme';
import { UserMetadata } from '../../hooks';
import { ReactComponent as PersonFill } from 'bootstrap-icons/icons/person-fill.svg';
import { ReactComponent as DoorOpenIcon } from 'bootstrap-icons/icons/door-open.svg';
import Avatar from '../core/Avatar';
import Typography from '../core/Typography';
import User from './User';
import Button from '../core/Button';
import { useHistory } from 'react-router-dom';
import Icon from '../core/Icon';

const useStyles = createStyles(theme => ({
  popover: {
    padding: 0,
  },
  userHeader: {
    background: theme.palette.neutralLight,
    padding: `${theme.shape.spacing(2)}px ${theme.shape.spacing(4)}px`,
  },
}));

interface UserSegmentProps {
  orientation: 'vertical' | 'horizontal';
  userMetadata: UserMetadata;
  emailVerified: boolean;
}

const UserSegment: FC<UserSegmentProps> = ({ orientation, userMetadata, emailVerified }) => {
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
        <Overlay
          show={dropdownOpen}
          target={popoverAnchor}
          placement="bottom-end"
          container={popoverAnchor.current}
          containerPadding={20}
          rootClose
          onHide={() => setDropdownOpen(false)}
        >
          <Popover id="popover-contained">
            <Popover.Content className={styles.popover}>
              <Box display="flex" flexDirection={'column'} maxWidth={280}>
                <Box display="flex" flexDirection="column" alignItems="center" className={styles.userHeader}>
                  <Avatar size={'lg'} src={user.profile?.avatar} />
                  <Typography variant="h3" className={'text-center'}>
                    {user.displayName}
                  </Typography>
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
                  >
                    <Icon component={PersonFill} color="inherit" size="sm" />
                    <Typography variant="button" color="inherit">
                      My profile
                    </Typography>
                  </Button>
                </Box>
                <Box>
                  <Button
                    onClick={() => {
                      setDropdownOpen(false);
                      history.push('/auth/logout');
                    }}
                    variant="transparent"
                    inset
                    block
                    small
                  >
                    <Icon component={DoorOpenIcon} color="inherit" size="sm" />
                    <Typography variant="button" color="inherit">
                      Sign out
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Popover.Content>
          </Popover>
        </Overlay>
      </>
    )
  );
};

export default UserSegment;
