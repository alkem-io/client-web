import { Box, Drawer, DrawerProps, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ReactComponent as ChatIcon } from 'bootstrap-icons/icons/chat.svg';
import { ReactComponent as EnvelopeIcon } from 'bootstrap-icons/icons/envelope.svg';
import { ReactComponent as HouseIcon } from 'bootstrap-icons/icons/house.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as SlidersIcon } from 'bootstrap-icons/icons/sliders.svg';
import clsx from 'clsx';
import React, { FC, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useConfig, UserMetadata, createStyles } from '../../../../hooks';
import { SidebarEcoverseFragment } from '../../../../models/graphql-schema';
import { Image } from '../../../core/Image';
import Tag from '../../../core/Tag';
import SidebarItem from './SidebarItem';
import SidebarItemEcoverse from './SidebarItemEcoverse';

interface SidebarProps {
  isUserAuth?: boolean;
  ecoverses: SidebarEcoverseFragment[];
  userMetadata?: UserMetadata;
  drawerProps?: DrawerProps;
}

const useStyles = createStyles(theme => ({
  sidebarContainer: {
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
  },
  sidebarDynamic: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    overflowY: 'auto',
  },
  previewTag: {
    opacity: 1,
    zIndex: -1,
    right: theme.spacing(0),
    top: theme.spacing(0.0),
  },
  tagScale: {
    display: 'none',
    transform: 'scale(0.5)',
  },
  copyright: {
    padding: theme.spacing(2),
  },
}));

const Sidebar: FC<SidebarProps> = ({ isUserAuth, ecoverses, userMetadata, drawerProps }) => {
  const styles = useStyles();
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));
  const upMd = useMediaQuery(theme.breakpoints.up('md'));
  const { platform } = useConfig();

  const { open } = drawerProps || { open: upSm };
  const iconSize = 'md'; //upMd ? 'md' : upSm ? 'md' : 'sm';

  const LogoComponent = useMemo(() => {
    const isLarge = upMd || !upSm;
    const src = isLarge ? '/logo.png' : '/logo192.png';
    return (
      <Link component={RouterLink} to="/">
        <Box display="flex" flexDirection="column" padding={isLarge ? 4 : 2}>
          <Image src={src} alt="alkemio" />
        </Box>
      </Link>
    );
  }, [upMd, upSm]);

  return (
    <Drawer
      variant={upSm ? 'persistent' : 'temporary'}
      anchor="left"
      className={clsx(styles.sidebarContainer, upMd || !upSm ? styles.drawerWidthMax : styles.drawerWidthMin)}
      classes={{ paper: clsx(upMd || !upSm ? styles.drawerWidthMax : styles.drawerWidthMin) }}
      {...drawerProps}
      open={upSm || open}
    >
      <Box position="relative" display="flex" flexDirection="column">
        {LogoComponent}
        <Box position="absolute" className={clsx(styles.previewTag, upMd || !upSm ? '' : styles.tagScale)}>
          <Tag text={'public preview'} color="positive" />
        </Box>
      </Box>
      <div className={styles.sidebarStatic}>
        <SidebarItem
          iconProps={{ component: HouseIcon, size: iconSize, color: 'inherit' }}
          label="Home"
          centerLabel={upSm && !upMd}
          hideLabel={upSm && !upMd}
          tooltip="Home"
          to="/"
        />
      </div>
      <div className={styles.sidebarDynamic}>
        {ecoverses.map(x => (
          <SidebarItemEcoverse key={x.nameID} centerLabel={upSm && !upMd} hideLabel={upSm && !upMd} ecoverse={x} />
        ))}
        <SidebarItem
          iconProps={{ component: PeopleIcon, size: iconSize, color: 'inherit' }}
          label="Search"
          centerLabel={upSm && !upMd}
          hideLabel={upSm && !upMd}
          tooltip={isUserAuth ? 'Search' : 'Sign in to browse the community'}
          to="/search"
          disabled={!isUserAuth}
        />
        <SidebarItem
          iconProps={{ component: ChatIcon, size: iconSize, color: 'inherit' }}
          label="Messages"
          centerLabel={upSm && !upMd}
          hideLabel={upSm && !upMd}
          tooltip={isUserAuth ? 'Messages' : 'Sign in to message the community'}
          to="/messages"
          disabled={!isUserAuth}
        />
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <div className={styles.sidebarStatic}>
        {userMetadata && userMetadata.isAdmin && (
          <SidebarItem
            iconProps={{ component: SlidersIcon, size: iconSize, color: 'inherit' }}
            label="Admin"
            centerLabel={upSm && !upMd}
            hideLabel={upSm && !upMd}
            tooltip="Admin"
            to="/admin"
            disabled={!isUserAuth}
          />
        )}
        <SidebarItem
          iconProps={{ component: EnvelopeIcon, size: iconSize, color: 'inherit' }}
          label="Contact us"
          centerLabel={upSm && !upMd}
          hideLabel={upSm && !upMd}
          tooltip="Contact us"
          to={platform?.feedback || ''}
          buttonProps={{
            as: 'a',
            href: platform?.feedback,
            target: '_blank',
          }}
        />
      </div>
    </Drawer>
  );
};
export default Sidebar;
