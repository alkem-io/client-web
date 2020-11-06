import { ReactComponent as ChatFillIcon } from 'bootstrap-icons/icons/chat-fill.svg';
import { ReactComponent as ChatIcon } from 'bootstrap-icons/icons/chat.svg';
import { ReactComponent as GlobeIcon } from 'bootstrap-icons/icons/globe2.svg';
import { ReactComponent as PeopleFillIcon } from 'bootstrap-icons/icons/people-fill.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as SlidersIcon } from 'bootstrap-icons/icons/sliders.svg';
import { ReactComponent as ThreeDotsIcon } from 'bootstrap-icons/icons/three-dots.svg';
import { ReactComponent as DoorOpenIcon } from 'bootstrap-icons/icons/door-open.svg';
import React, { FC, useRef, useState } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { createStyles } from '../../hooks/useTheme';
import { useAuthenticationContext } from '../../hooks/useAuthenticationContext';
import Button from '../core/Button';
import Hidden from '../core/Hidden';
import Icon from '../core/Icon';
import IconButton from '../core/IconButton';

interface NavigationProps {
  maximize: boolean;
  showAdmin?: boolean;
}

const useNavigationStyles = createStyles(theme => ({
  navLinkOffset: {
    marginLeft: theme.shape.spacing(4),

    [theme.media.down('xl')]: {
      marginLeft: theme.shape.spacing(2),
    },
  },
  menuItem: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',

    '& > *:last-child': {
      marginLeft: theme.shape.spacing(2),
    },
  },
}));

const Navigation: FC<NavigationProps> = ({ maximize, showAdmin = false }) => {
  const styles = useNavigationStyles();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { context, isAuthenticated } = useAuthenticationContext();
  const popoverAnchorMdUp = useRef(null);
  const popoverAnchorMdDown = useRef(null);

  return (
    <>
      <Hidden mdDown>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IconButton className={styles.navLinkOffset} as={Link} to="/">
            <Icon component={GlobeIcon} color="inherit" size={maximize ? 'lg' : 'sm'} />
          </IconButton>
          <IconButton
            className={styles.navLinkOffset}
            as={Link}
            to="/community"
            hoverIcon={<Icon component={PeopleFillIcon} color="inherit" size={maximize ? 'lg' : 'sm'} />}
          >
            <Icon component={PeopleIcon} color="inherit" size={maximize ? 'lg' : 'sm'} />
          </IconButton>
          <IconButton
            className={styles.navLinkOffset}
            as={Link}
            to="/messages"
            hoverIcon={<Icon component={ChatFillIcon} color="inherit" size={maximize ? 'lg' : 'sm'} />}
          >
            <Icon component={ChatIcon} color="inherit" size={maximize ? 'lg' : 'sm'} />
          </IconButton>
          <div style={{ display: 'flex', alignItems: 'center' }} ref={popoverAnchorMdDown}>
            {(showAdmin || isAuthenticated) && (
              <IconButton className={styles.navLinkOffset} onClick={() => setDropdownOpen(x => !x)}>
                <Icon component={ThreeDotsIcon} color="inherit" size={maximize ? 'lg' : 'sm'} />
              </IconButton>
            )}
          </div>
          <Overlay
            show={dropdownOpen}
            target={popoverAnchorMdDown}
            placement="bottom"
            container={popoverAnchorMdDown.current}
            containerPadding={20}
          >
            <Popover id="popover-contained">
              <Popover.Content>
                <div className="d-flex flex-grow-1 flex-column">
                  {showAdmin && (
                    <Button text="Admin" as={Link} to="/admin" inset className={styles.menuItem}>
                      <Icon component={SlidersIcon} color="inherit" size="sm" />
                    </Button>
                  )}
                  {isAuthenticated && (
                    <Button text="Sign out" onClick={context.handleSignOut} inset className={styles.menuItem}>
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
        <div style={{ display: 'flex', alignItems: 'center' }} ref={popoverAnchorMdUp}>
          <IconButton className={styles.navLinkOffset} onClick={() => setDropdownOpen(x => !x)}>
            <Icon component={ThreeDotsIcon} color="inherit" size={maximize ? 'lg' : 'sm'} />
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
                <Button text="Community" as={Link} to="/community" inset className={styles.menuItem}>
                  <Icon component={PeopleIcon} color="inherit" size="sm" />
                </Button>
                <Button text="Messages" as={Link} to="/messages" inset className={styles.menuItem}>
                  <Icon component={ChatIcon} color="inherit" size="sm" />
                </Button>
                {showAdmin && (
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
