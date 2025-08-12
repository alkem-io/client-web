import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { ReactNode } from 'react';
import close from '../../../assets/clear-button.svg';

type Props = {
  title: string | ReactNode;
  subtitle: string;
  toggleChat: () => void;
  showCloseButton: boolean;
  titleAvatar?: string;
};

function Header({ title, subtitle, toggleChat, showCloseButton, titleAvatar }: Props) {
  return (
    <Box
      sx={{
        backgroundColor: theme => theme.palette.primary.main,
        borderRadius: '10px 10px 0 0',
        color: theme => theme.palette.common.white,
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        padding: theme => theme.spacing(1),
        '@media (max-width:800px)': {
          borderRadius: 0,
          flexShrink: 0,
          position: 'relative',
        },
      }}
    >
      {showCloseButton && (
        <IconButton
          onClick={toggleChat}
          sx={theme => ({
            zIndex: 1, // Otherwise the custom header makes it non-clickable
            top: theme.spacing(0.5),
            right: theme.spacing(1),
            display: 'block',
            border: 0,
            position: 'absolute',
            width: 30,
            paddingLeft: 0,
            paddingRight: 0,
            cursor: 'pointer',
            background: 'transparent',
          })}
          aria-label="Close"
        >
          <Box
            component="img"
            src={close}
            alt="close"
            sx={{
              width: 20,
              height: 20,
              padding: 0.2,
            }}
          />
        </IconButton>
      )}
      <Box
        component="h4"
        sx={{
          fontSize: 24,
          m: 0,
          py: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          padding: 0,
        }}
      >
        {titleAvatar && (
          <Box
            component="img"
            src={titleAvatar}
            alt="profile"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              marginRight: 1.25,
              verticalAlign: 'middle',
            }}
          />
        )}
        {title}
      </Box>
      <Box component="span">{subtitle}</Box>
    </Box>
  );
}

export default Header;
