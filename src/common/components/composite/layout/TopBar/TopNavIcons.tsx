import { Box, Button, List } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ProfileMenuItem from './ProfileMenuItem';
import { ChallengeIcon } from '../../../../../domain/challenge/challenge/icon/ChallengeIcon';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useLocation } from 'react-router-dom';

const PREFIX = 'TopNavIcons';

const classes = {
  bar: `${PREFIX}-bar`,
  button: `${PREFIX}-buttons`,
  buttonSelected: `${PREFIX}-buttonSelected`,
  buttonSignIn: `${PREFIX}-buttonSignIn`,
};

const TopBarButton = styled(Button)(({ theme }) => ({
  height: '100%',
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
  '.MuiButton-startIcon': {
    margin: 0,
  },
  '.MuiButton-startIcon>*:nth-of-type(1)': {
    fontSize: theme.spacing(3.7),
  },
  '.MuiButton-startIcon>div': {
    width: theme.spacing(3.7),
    height: theme.spacing(3.7),
  },
  '&.Mui-disabled': {
    color: theme.palette.grey[400],
    opacity: 0.8,
  },
  '&:last-child': {
    marginRight: 0,
  },
  [`&.${classes.buttonSelected}`]: {
    borderBottomColor: theme.palette.primary.main,
  },
  [`&.${classes.button}.${classes.buttonSignIn}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  [`&.${classes.button}.${classes.buttonSignIn}:hover`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const Root = styled(Box)(() => ({
  height: '100%',
  nav: { height: '100%' },
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
  const { pathname } = useLocation();

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
      {
        title: t('common.forum'),
        icon: <ForumOutlinedIcon />,
        url: '/forum',
      },
    ],
    [t]
  );

  const selectedIndex = useMemo(() => menuItems.findIndex(x => pathname.startsWith(x.url)), [pathname, menuItems]);

  return (
    <Root>
      <List component="nav" disablePadding dense sx={{ display: 'flex', flexDirection: 'row' }}>
        {menuItems.map(({ title, icon, url, disabled, hidden }, i) => {
          if (hidden) {
            return null;
          }
          return (
            <TopBarButton
              key={i}
              className={selectedIndex === i ? classes.buttonSelected : undefined}
              href={url}
              color="primary"
              disabled={disabled}
              hidden={hidden}
              startIcon={icon}
            >
              {title}
            </TopBarButton>
          );
        })}

        <ProfileMenuItem buttonComponent={TopBarButton} />
      </List>
    </Root>
  );
};

export default TopNavIcons;
