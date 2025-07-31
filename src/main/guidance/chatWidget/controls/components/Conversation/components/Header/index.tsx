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
        backgroundColor: theme => theme.palette.primary.main || '#36b9c8', // $turqois-1 fallback
        borderRadius: '10px 10px 0 0',
        color: 'common.white',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        py: '15px',
        pb: '25px',

        // Responsive (mobile fullscreen override)
        '@media (max-width:800px)': {
          borderRadius: 0,
          flexShrink: 0,
          position: 'relative',
        },
      }}
    >
      {showCloseButton && (
        <IconButton
          // Acts as the close button, position absolute if needed
          onClick={toggleChat}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            m: 1.5,
            display: 'block', // Always shown if showCloseButton
            p: 1,
            zIndex: 1,

            // Responsive overrides, inlining close-button-fs if needed
            '@media (max-width:800px)': {
              borderRadius: 0,
              flexShrink: 0,
              position: 'relative',
            },
          }}
          aria-label="Close"
        >
          <Box
            component="img"
            src={close}
            alt="close"
            sx={{
              width: 24,
              height: 24,
              // Add responsive/close-fs tweaks
              '@media (max-width:800px)': {
                // ...close-fs mixin here
                width: 28,
                height: 28,
              },
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

          // Responsive title-fs mixin if needed
          '@media (max-width:800px)': {
            // ...title-fs mixin here
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
