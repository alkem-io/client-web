import Badge from './components/Badge';
import { useMessages } from '../../context/MessagesContext';
import { useChatBehavior } from '../../context/ChatBehaviorContext';
import { slideIn, rotationLr, rotationRl } from './LauncherStyles';

import { Box, IconButton } from '@mui/material';

import openLauncherImg from '../../assets/launcher_button.svg';
import close from '../../assets/clear-button.svg';

type Props = {
  toggle: () => void;
  chatId: string;
  openLabel: string;
  closeLabel: string;
  closeImg: string;
  openImg: string;
  showBadge?: boolean;
};

function Launcher({ toggle, chatId, openImg, closeImg, openLabel, closeLabel, showBadge }: Props) {
  const {
    state: { badgeCount },
    setBadgeCount,
  } = useMessages();

  const {
    state: { showChat },
  } = useChatBehavior();

  const toggleChat = () => {
    toggle();
    if (!showChat) setBadgeCount(0);
  };

  return (
    <IconButton
      type="button"
      aria-controls={chatId}
      onClick={toggleChat}
      sx={{
        alignSelf: 'flex-end',
        border: 0,
        borderRadius: '50%',
        boxShadow: theme => `0px 2px 10px 1px ${theme.palette.grey[300]}`,
        height: 60,
        width: 60,
        mt: 1.25,
        position: 'relative',
        margin: 0,
        cursor: 'pointer',
        transition: 'transform 0.5s',
        backgroundColor: theme => theme.palette.primary.main,
        animation: `${slideIn} 0.5s`,
        '&:focus': { outline: 'none' },
        '&:hover': {
          backgroundColor: theme => theme.palette.primary.main,
        },
        '@media (max-width:800px)': {
          bottom: 0,
          margin: '20px',
          position: 'fixed',
          right: 0,
        },
        ...(showChat && {
          '@media (max-width:800px)': {
            display: 'none',
          },
        }),
      }}
    >
      {/* Badge (positioned absolutely inside the button) */}
      {!showChat && showBadge && badgeCount > 0 && <Badge badge={badgeCount} />}
      {/* Chat icon image */}
      <Box
        component="img"
        src={showChat ? closeImg || close : openImg || openLauncherImg}
        alt={showChat ? openLabel : closeLabel}
        sx={{
          width: showChat ? 20 : 28,
          height: showChat ? 20 : 28,
          // Animations
          transition: 'transform 0.5s',
          animation: showChat ? `${rotationLr} 0.5s` : `${rotationRl} 0.5s`,
        }}
      />
    </IconButton>
  );
}

export default Launcher;
