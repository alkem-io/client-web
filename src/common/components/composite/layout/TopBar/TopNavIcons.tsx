import { Box, Button, List } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useRouteMatch from '../../../../../core/routing/useRouteMatch';
import { RouterLink } from '../../../core/RouterLink';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ProfileMenuItem from './ProfileMenuItem';
import { TopBarHeight } from './TopBar';
import { ChallengeIcon } from '../../../../../domain/shared/icons/ChallengeIcon';

const PREFIX = 'TopNavIcons';

const classes = {
  bar: `${PREFIX}-bar`,
  button: `${PREFIX}-buttons`,
  buttonSelected: `${PREFIX}-buttonSelected`,
};

const Root = styled(Box)(({ theme }) => ({
  [`& .${classes.button}`]: {
    height: theme.spacing(TopBarHeight),
    marginRight: theme.spacing(1),
    flexDirection: 'column',
    color: theme.palette.common.black,
    borderBottomWidth: '2px',
    borderBottomColor: 'transparent',
    borderBottomStyle: 'solid',
    borderRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    fontSize: '9px', //theme.typography.caption.fontSize,
    '& .MuiButton-startIcon': {
      margin: 0,
      marginBottom: theme.spacing(1),
    },
    '& .MuiButton-startIcon>*:nth-of-type(1)': {
      fontSize: theme.spacing(3.7),
    },
    '& .MuiButton-startIcon>div': {
      width: theme.spacing(3.7),
      height: theme.spacing(3.7),
    },
    '&.Mui-disabled': {
      color: theme.palette.grey[400],
      opacity: 0.8,
    },
  },
  [`& .${classes.button}:last-child`]: {
    marginRight: 0,
  },
  [`& .${classes.buttonSelected}`]: {
    borderBottomColor: theme.palette.primary.main,
  },
}));

type MenuItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  hidden?: boolean;
};

const TopNavIcons = () => {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        title: t('common.challenges'),
        icon: <ChallengeIcon />,
        url: '/challenges',
      },
      {
        title: t('common.contributors'),
        icon: <GroupOutlinedIcon />,
        url: '/contributors',
      },
    ],
    [t]
  );

  const match = useRouteMatch([...menuItems].reverse().map(x => x.url));
  const selectedIndex = useMemo(() => menuItems.findIndex(x => x.url === match?.pathname), [menuItems, match]);

  return (
    <Root>
      <List component="nav" disablePadding dense sx={{ display: 'flex', flexDirection: 'row' }}>
        {menuItems.map(({ title, icon, url, disabled, hidden }, i) => {
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
              startIcon={icon}
            >
              {title}
            </Button>
          );
        })}

        <ProfileMenuItem buttonClassName={classes.button} />
      </List>
    </Root>
  );
};

export default TopNavIcons;
