import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { ReactNode } from 'react';
import close from '../../../../assets/clear-button.svg';

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
        backgroundColor: theme => theme.palette.primary.main || '#36b9c8',
        borderRadius: '10px 10px 0 0',
        color: 'common.white',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        py: '15px',
        pb: '25px',
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
            backgroundColor: theme.palette.primary.main,
            m: 1.5,
            p: 1,
            zIndex: 1, // Otherwise the custom header makes it non-clickable
            top: theme.spacing(1.5),
            right: theme.spacing(1),
            display: 'block',
            border: 0,
            position: 'absolute',
            width: theme.spacing(3),
            paddingX: 0,
            cursor: 'pointer',
            background: 'transparent',
            '@media (max-width:800px)': {
              backgroundColor: '#35cce6',
              border: 0,
              display: 'block',
              position: 'absolute',
              right: '10px',
              top: '20px',
              width: '40px',
            },
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
          '@media (max-width:800px)': {
            padding: '0 0 15px 0',
          },
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
