import React, { FC } from 'react';
import { ReactComponent as HouseIcon } from 'bootstrap-icons/icons/house.svg';
import { ReactComponent as ChatIcon } from 'bootstrap-icons/icons/chat.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { createStyles } from '../../../hooks/useTheme';
import { EcoverseDetailsFragment } from '../../../types/graphql-schema';
import SidebarItemEcoverse from './SidebarItemEcoverse';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  isUserAuth?: boolean;
  ecoverses: EcoverseDetailsFragment[];
}

const useStyles = createStyles(theme => ({
  sidebarContainer: {
    zIndex: 100,
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: `calc(100vh - ${theme.shape.spacing(4)}px)`,
    width: theme.sidebar.width,
    position: 'fixed',
    marginTop: theme.shape.spacing(2),
    marginBottom: theme.shape.spacing(2),
    marginLeft: theme.shape.spacing(2),
    backgroundColor: theme.palette.neutralLight,
    overflowX: 'hidden',
    border: `1px solid ${theme.palette.neutralMedium}`,
  },
  sidebarStatic: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.shape.spacing(2),
    marginTop: theme.shape.spacing(1),
    marginBottom: theme.shape.spacing(1),
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
}));

const Sidebar: FC<SidebarProps> = ({ isUserAuth, ecoverses }) => {
  const styles = useStyles();

  return (
    <div id="sidebar-container" className={styles.sidebarContainer}>
      <div id="sidebar-static-top" className={styles.sidebarStatic}>
        <SidebarItem icon={HouseIcon} tooltip="Home" to="/" />
      </div>
      <div id="sidebar-dynamic" className={styles.sidebarDynamic}>
        {ecoverses.map(x => (
          <SidebarItemEcoverse ecoverse={x} />
        ))}
        <SidebarItem icon={PeopleIcon} tooltip="Community" to="/community" disabled={!isUserAuth} />
        <SidebarItem icon={ChatIcon} tooltip="Messages" to="/messages" disabled={!isUserAuth} />
      </div>
    </div>
  );
};
export default Sidebar;
