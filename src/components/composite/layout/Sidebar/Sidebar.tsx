import { Box, Drawer, DrawerProps } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ReactComponent as ChatIcon } from 'bootstrap-icons/icons/chat.svg';
import { ReactComponent as EnvelopeIcon } from 'bootstrap-icons/icons/envelope.svg';
import { ReactComponent as HouseIcon } from 'bootstrap-icons/icons/house.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as SlidersIcon } from 'bootstrap-icons/icons/sliders.svg';
import clsx from 'clsx';
import React, { FC } from 'react';
import { env } from '../../../../types/env';
import { createStyles } from '../../../../hooks/useTheme';
import { UserMetadata } from '../../../../hooks';
import { EcoverseDetailsFragment } from '../../../../models/graphql-schema';
import { Image } from '../../../core/Image';
import Tag from '../../../core/Tag';
import SidebarItem from './SidebarItem';
import SidebarItemEcoverse from './SidebarItemEcoverse';

interface SidebarProps {
  isUserAuth?: boolean;
  ecoverses: EcoverseDetailsFragment[];
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
  logoLg: {
    padding: `${theme.spacing(4)}px`,
  },
  logoSm: {
    padding: `${theme.spacing(2)}px ${theme.spacing(2)}px`,
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
    padding: `${theme.spacing(2)}px`,
  },
}));

const Sidebar: FC<SidebarProps> = ({ isUserAuth, ecoverses, userMetadata, drawerProps }) => {
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
      <Box position="relative" display="flex" flexDirection="column">
        {upMd || !upSm ? (
          <Image
            src={'/logo.png'}
            className={styles.logoLg}
            alt="alkemio"
            onError={() => {
              /* TODO */
            }}
          />
        ) : (
          <Image
            src={'/logo192.png'}
            className={styles.logoSm}
            alt="alkemio"
            onError={() => {
              /* TODO */
            }}
          />
        )}
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
          to={env?.REACT_APP_FEEDBACK_URL || ''}
          buttonProps={{
            as: 'a',
            href: env?.REACT_APP_FEEDBACK_URL,
            target: '_blank',
          }}
        />
        {/* <Box className={styles.copyright}>
          <Typography variant="caption" color="neutralMedium" weight="boldLight">
            © 2021 Cherrytwist Foundation
          </Typography>
        </Box> */}
      </div>
    </Drawer>
  );
};
export default Sidebar;
