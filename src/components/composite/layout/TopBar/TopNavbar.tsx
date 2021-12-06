import clsx from 'clsx';
import React, { useState } from 'react';
import { Box, Button, Container, List } from '@mui/material';
import { styled, alpha, emphasize } from '@mui/material/styles';
import { RouterLink } from '../../../core/RouterLink';
import { useUserContext } from '../../../../hooks';

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
      backgroundColor: emphasize(theme.palette.primary.main, 0.3),
    },

    '&.Mui-disabled': {
      backgroundColor: alpha(theme.palette.common.white, 0.8),
    },
  },
  [`& .${classes.buttonSelected}`]: {
    backgroundColor: emphasize(theme.palette.primary.main, 0.5),
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user, isAuthenticated } = useUserContext();

  const menuItems: MenuItem[] = [
    {
      title: 'home',
      url: '/',
    },
    {
      title: 'challenges',
      url: '/challenges',
      // not auth`d user view is going to be handled by https://github.com/alkem-io/client-web/issues/1424
      disabled: !isAuthenticated,
    },
    {
      title: 'contributions',
      url: '/',
      disabled: true,
    },
    {
      title: 'admin',
      url: '/admin',
      hidden: !Boolean(user?.isAdmin ?? false),
    },
  ];

  return (
    <Root>
      <Box className={classes.bar}>
        <Container maxWidth="xl">
          <List
            component="nav"
            aria-label="main mailbox folders"
            disablePadding
            dense
            sx={{ display: 'flex', flexDirection: 'row' }}
          >
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
                  onClick={() => setSelectedIndex(i)}
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
export default TopNavbar;
