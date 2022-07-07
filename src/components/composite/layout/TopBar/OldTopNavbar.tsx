import { Box, Button, Container, List } from '@mui/material';
import { grey } from '@mui/material/colors';
import { alpha, emphasize, styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useUserContext } from '../../../../hooks';
import useRouteMatch from '../../../../hooks/routing/useRouteMatch';
import useCurrentBreakpoint from '../../../../hooks/useCurrentBreakpoint';
import { RouterLink } from '../../../core/RouterLink';

const PREFIX = 'TopNavbar';

const classes = {
  button: `${PREFIX}-buttons`,
  buttonSelected: `${PREFIX}-buttonSelected`,
  bar: `${PREFIX}-bar`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.button}`]: {
    padding: theme.spacing(1, 2),
    color: theme.palette.common.white,
    border: 'unset',
    borderRadius: 0,

    '&:hover': {
      backgroundColor: emphasize(theme.palette.primary.main, 0.25),
    },

    '&.Mui-disabled': {
      backgroundColor: alpha(grey[800], 0.0),
      color: theme.palette.grey[400],
      opacity: 0.7,
    },
  },
  [`& .${classes.buttonSelected}`]: {
    backgroundColor: emphasize(theme.palette.primary.main, 0.2),
  },
  [`& .${classes.bar}`]: {
    flexGrow: 1,
    background: theme.palette.primary.main,
  },
}));

type MenuItem = {
  title: string;
  url: string;
  disabled?: boolean;
  hidden?: boolean;
};

const TopNavbar = () => {
  const { user } = useUserContext();
  const breakpoint = useCurrentBreakpoint();

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        title: 'home',
        url: '/',
      },
      {
        title: 'challenges',
        url: '/challenges',
      },
      {
        title: 'contributors',
        url: '/contributors',
      },
      {
        title: 'admin',
        url: '/admin',
        hidden: !Boolean(user?.isAdmin ?? false),
      },
    ],
    [user?.isAdmin]
  );

  const match = useRouteMatch([...menuItems].reverse().map(x => x.url));
  const selectedIndex = useMemo(() => menuItems.findIndex(x => x.url === match?.pathname), [menuItems, match]);

  return (
    <Root>
      <Box className={classes.bar}>
        <Container maxWidth={breakpoint}>
          <List component="nav" disablePadding dense sx={{ display: 'flex', flexDirection: 'row' }}>
            {menuItems.map(({ title, url, disabled, hidden }, i) => {
              if (hidden) {
                return null;
              }

              return (
                <Button
                  key={i}
                  className={clsx(classes.button, { [classes.buttonSelected]: selectedIndex === i })}
                  component={RouterLink}
                  to={url}
                  color="primary"
                  disabled={disabled}
                  hidden={hidden}
                >
                  {title}
                </Button>
              );
            })}
          </List>
        </Container>
      </Box>
    </Root>
  );
};

export const TopNavbarSpacer = () => {
  return (
    <Root sx={{ visibility: 'hidden' }}>
      <Box className={classes.bar}>
        <List disablePadding dense>
          <Button className={clsx(classes.button)}>Spacer</Button>
        </List>
      </Box>
    </Root>
  );
};

export default TopNavbar;
