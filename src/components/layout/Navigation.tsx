import React, { FC, useRef, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { ReactComponent as ChatIcon } from 'bootstrap-icons/icons/chat.svg';
import { ReactComponent as DoorOpenIcon } from 'bootstrap-icons/icons/door-open.svg';
import { ReactComponent as GlobeIcon } from 'bootstrap-icons/icons/globe2.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as PersonFill } from 'bootstrap-icons/icons/person-fill.svg';
import { ReactComponent as SlidersIcon } from 'bootstrap-icons/icons/sliders.svg';
import { ReactComponent as ListIcon } from 'bootstrap-icons/icons/list.svg';
import { useAuthenticationContext } from '../../hooks/useAuthenticationContext';
import { createStyles } from '../../hooks/useTheme';
import { UserMetadata } from '../../hooks/useUserMetadataWrapper';
import Button from '../core/Button';
import Hidden from '../core/Hidden';
import Icon from '../core/Icon';
import IconButton from '../core/IconButton';
import { SEARCH_PAGE } from '../../models/Constants';

interface NavigationProps {
  maximize: boolean;
  userMetadata?: UserMetadata;
}

const useNavigationStyles = createStyles(theme => ({
  navLinkOffset: {},
  menuItem: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',

    '& > *:last-child': {
      marginLeft: theme.shape.spacing(2),
    },
  },
  flexCenterItems: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const Navigation: FC<NavigationProps> = ({ maximize, userMetadata }) => {
  const styles = useNavigationStyles();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const popoverAnchorMdUp = useRef(null);
  const popoverAnchorMdDown = useRef(null);
  const history = useHistory();
  const { isAuthenticated } = useAuthenticationContext();

  return (
    <>
      <Hidden mdDown>
        <div className={styles.flexCenterItems}>
          <div className={styles.flexCenterItems} ref={popoverAnchorMdDown}></div>
          <Overlay
            show={dropdownOpen}
            target={popoverAnchorMdDown}
            placement="bottom"
            container={popoverAnchorMdDown.current}
            containerPadding={20}
            rootClose
            onHide={() => setDropdownOpen(false)}
          >
            <Popover id="popover-contained">
              <Popover.Content>
                {userMetadata && (
                  <Button
                    text="My profile"
                    onClick={() => {
                      setDropdownOpen(false);
                      history.push('/profile');
                    }}
                    inset
                    className={styles.menuItem}
                  >
                    <Icon component={PersonFill} color="inherit" size="sm" />
                  </Button>
                )}
                <div className="d-flex flex-grow-1 flex-column">
                  {userMetadata && userMetadata.isAdmin && (
                    <Button
                      text="Admin"
                      as={Link}
                      to="/admin"
                      inset
                      className={styles.menuItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Icon component={SlidersIcon} color="inherit" size="sm" />
                    </Button>
                  )}
                  {isAuthenticated && (
                    <Button
                      text="Sign out"
                      as={Link}
                      to={'/auth/logout'}
                      inset
                      className={styles.menuItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Icon component={DoorOpenIcon} color="inherit" size="sm" />
                    </Button>
                  )}
                </div>
              </Popover.Content>
            </Popover>
          </Overlay>
        </div>
      </Hidden>
      <Hidden mdUp>
        <div className={styles.flexCenterItems} ref={popoverAnchorMdUp}>
          <IconButton className={styles.navLinkOffset} onClick={() => setDropdownOpen(x => !x)}>
            <Icon component={ListIcon} color="inherit" size={maximize ? 'lg' : 'sm'} />
          </IconButton>
        </div>
        <Overlay
          show={dropdownOpen}
          target={popoverAnchorMdUp}
          placement="bottom"
          container={popoverAnchorMdUp.current}
          containerPadding={20}
        >
          <Popover id="popover-contained">
            <Popover.Content>
              <div className="d-flex flex-grow-1 flex-column">
                <Button text="Ecoverse" as={Link} to="/" inset className={styles.menuItem}>
                  <Icon component={GlobeIcon} color="inherit" size="sm" />
                </Button>
                <Button
                  disabled={!Boolean(userMetadata)}
                  text="Community"
                  as={Link}
                  to={SEARCH_PAGE}
                  inset
                  className={styles.menuItem}
                >
                  <Icon component={PeopleIcon} color="inherit" size="sm" />
                </Button>
                <Button
                  disabled={!Boolean(userMetadata)}
                  text="Messages"
                  as={Link}
                  to="/messages"
                  inset
                  className={styles.menuItem}
                >
                  <Icon component={ChatIcon} color="inherit" size="sm" />
                </Button>
                {userMetadata && userMetadata.isAdmin && (
                  <Button text="Admin" as={Link} to="/admin" inset className={styles.menuItem}>
                    <Icon component={SlidersIcon} color="inherit" size="sm" />
                  </Button>
                )}
              </div>
            </Popover.Content>
          </Popover>
        </Overlay>
      </Hidden>
    </>
  );
};

export default Navigation;
