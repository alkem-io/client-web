import React, { FC } from 'react';
import { ReactComponent as HouseIcon } from 'bootstrap-icons/icons/house.svg';
import { ReactComponent as ChatIcon } from 'bootstrap-icons/icons/chat.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as EnvelopeIcon } from 'bootstrap-icons/icons/envelope.svg';
import { createStyles } from '../../../hooks/useTheme';
import { EcoverseDetailsFragment } from '../../../types/graphql-schema';
import SidebarItemEcoverse from './SidebarItemEcoverse';
import SidebarItem from './SidebarItem';
import { env } from '../../../env';
import { Drawer, DrawerProps } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Image } from '../../core/Image';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import clsx from 'clsx';

interface SidebarProps {
  isUserAuth?: boolean;
  ecoverses: EcoverseDetailsFragment[];
  drawerProps?: DrawerProps;
}

const useStyles = createStyles(theme => ({
  sidebarContainer: {
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    flexShrink: 0,
  },
  drawerWidthMax: {
    width: theme.sidebar.maxWidth,
  },
  drawerWidthMin: {
    width: theme.sidebar.minWidth,
  },
  sidebarStatic: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.shape.spacing(2),
    marginTop: theme.shape.spacing(2),
    marginBottom: theme.shape.spacing(2),
  },
  sidebarDynamic: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.shape.spacing(2),
    flexGrow: 1,
    overflowY: 'auto',
    marginTop: theme.shape.spacing(1),
    marginBottom: theme.shape.spacing(1),
  },
  logoLg: {
    padding: `${theme.shape.spacing(4)}px ${theme.shape.spacing(2)}px`,
  },
  logoSm: {
    padding: `${theme.shape.spacing(2)}px`,
  },
}));

const Sidebar: FC<SidebarProps> = ({ isUserAuth, ecoverses, drawerProps }) => {
  const styles = useStyles();
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));
  const upMd = useMediaQuery(theme.breakpoints.up('md'));

  const { open } = drawerProps || { open: upSm };
  const iconSize = 'md'; //upMd ? 'md' : upSm ? 'md' : 'sm';

  return (
    <Drawer
      variant={upSm ? 'persistent' : 'temporary'}
      anchor="left"
      className={clsx(styles.sidebarContainer, upMd || !upSm ? styles.drawerWidthMax : styles.drawerWidthMin)}
      classes={{ paper: clsx(upMd || !upSm ? styles.drawerWidthMax : styles.drawerWidthMin) }}
      {...drawerProps}
      open={upSm || open}
    >
      <div className={styles.sidebarStatic}>
        {upMd || !upSm ? (
          <Image
            src={'.\\logo.png'}
            className={styles.logoLg}
            alt="alkemio"
            onError={() => {
              /* TODO */
            }}
          />
        ) : (
          <Image
            src={'.\\logo192.png'}
            className={styles.logoSm}
            alt="alkemio"
            onError={() => {
              /* TODO */
            }}
          />
        )}
        <SidebarItem
          iconProps={{ component: HouseIcon, size: iconSize, color: 'inherit' }}
          label="Home"
          hideLabel={upSm && !upMd}
          tooltip="Home"
          to="/"
        />
      </div>
      <div className={styles.sidebarDynamic}>
        {ecoverses.map(x => (
          <SidebarItemEcoverse key={x.nameID} hideLabel={upSm && !upMd} ecoverse={x} />
        ))}
        <SidebarItem
          iconProps={{ component: PeopleIcon, size: iconSize, color: 'inherit' }}
          label="Search"
          hideLabel={upSm && !upMd}
          tooltip="Search"
          to="/search"
          disabled={!isUserAuth}
        />
        <SidebarItem
          iconProps={{ component: ChatIcon, size: iconSize, color: 'inherit' }}
          label="Messages"
          hideLabel={upSm && !upMd}
          tooltip="Messages"
          to="/messages"
          disabled={!isUserAuth}
        />
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <div className={styles.sidebarStatic}>
        <SidebarItem
          iconProps={{ component: EnvelopeIcon, size: iconSize, color: 'inherit' }}
          label="Contact us"
          hideLabel={upSm && !upMd}
          tooltip="Contact us"
          to={env?.REACT_APP_FEEDBACK_URL || ''}
          disabled={!isUserAuth}
        />
      </div>
    </Drawer>
  );
};
export default Sidebar;
