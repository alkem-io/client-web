import React, { FC } from 'react';
import { ReactComponent as HouseIcon } from 'bootstrap-icons/icons/house.svg';
import { ReactComponent as ChatIcon } from 'bootstrap-icons/icons/chat.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { createStyles } from '../../../hooks/useTheme';
import { UserMetadata } from '../../../hooks/useUserMetadataWrapper';
import { EcoverseDetailsFragment } from '../../../types/graphql-schema';
import SidebarItemEcoverse from './SidebarItemEcoverse';
import SidebarItemDivider from './SidebarItemDivider';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  userMetadata?: UserMetadata;
  ecoverses: EcoverseDetailsFragment[];
}

const useStyles = createStyles(theme => ({
  sidebarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: 'calc(100vh)',
    width: theme.sidebar.width,
    position: 'fixed',
    zIndex: 100,
    top: 0,
    left: 0,
    paddingTop: theme.earlyAccessAlert.height,
    backgroundColor: theme.palette.neutralLight,
    overflowX: 'hidden',
    border: `1px solid ${theme.palette.neutralMedium}`,
  },
  sidebarStatic: {
    flexShrink: 1,
  },
  sidebarDynamic: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    overflowY: 'auto',
  },
}));

const Sidebar: FC<SidebarProps> = ({ userMetadata, ecoverses }) => {
  const styles = useStyles();

  return (
    <div id="sidebar" className={styles.sidebarContainer}>
      <div id="sidebarStaticTop" className={styles.sidebarStatic}>
        <SidebarItem icon={HouseIcon} tooltip="Home" to="/" />
      </div>
      <SidebarItemDivider />
      <div id="sidebarDynamic" className={styles.sidebarDynamic}>
        {ecoverses.map(x => (
          <SidebarItemEcoverse ecoverse={x} />
        ))}
      </div>
      <SidebarItemDivider />
      <div id="sidebarStaticBottom" className={styles.sidebarStatic}>
        <SidebarItem icon={PeopleIcon} tooltip="Community" to="/community" disabled={!Boolean(userMetadata)} />
        <SidebarItem icon={ChatIcon} tooltip="Messages" to="/messages" disabled={!Boolean(userMetadata)} />
      </div>
    </div>
  );
};
export default Sidebar;
