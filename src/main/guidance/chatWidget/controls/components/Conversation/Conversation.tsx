import { useRef, useState } from 'react';
import { ReactNode } from 'react';
import { gutters } from '@/core/ui/grid/utils';

import Header from './components/Header';
import Messages from './components/Messages/Messages';
import Sender from './components/Sender';

import Box from '@mui/material/Box';

interface ISenderRef {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelectEmoji: (event: any) => void;
}

type Props = {
  title: string | ReactNode;
  subtitle: string;
  senderPlaceHolder: string;
  showCloseButton: boolean;
  disabledInput: boolean;
  autofocus: boolean;
  showChat: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendMessage: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggleChat: (...args: any[]) => any;
  profileAvatar?: string;
  titleAvatar?: string;
  sendButtonAlt: string;
  footer?: ReactNode;
  menuButton?: ReactNode;
};

function Conversation({
  title,
  subtitle,
  senderPlaceHolder,
  showCloseButton,
  disabledInput,
  autofocus,
  showChat,
  sendMessage,
  toggleChat,
  profileAvatar,
  titleAvatar,
  sendButtonAlt,
  footer,
  menuButton,
}: Props) {
  const senderRef = useRef<ISenderRef>(null!);
  const [pickerStatus, setPicket] = useState(false);

  const togglePicker = () => {
    setPicket(prevPickerStatus => !prevPickerStatus);
  };

  const handlerSendMsn = event => {
    sendMessage(event);
    if (pickerStatus) setPicket(false);
  };

  return (
    <Box
      id="rcw-conversation-container"
      aria-live="polite"
      sx={{
        borderRadius: '10px',
        boxShadow: theme => `0px 2px 10px 1px ${theme.palette.grey[300]}`,
        minWidth: 370,
        maxWidth: '90vw',
        height: '100%',
        position: 'relative',
        opacity: showChat ? 1 : 0,
        transform: showChat ? 'translateY(0px)' : 'translateY(10px)',
        zIndex: showChat ? 'auto' : -1,
        pointerEvents: showChat ? 'auto' : 'none',
        transition: showChat ? 'auto' : 'opacity 0.3s ease, transform 0.3s ease',
        marginBottom: gutters(0.5),
        overflow: 'hidden',
        '@media (max-width:800px)': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
        '@media screen and (orientation: portrait)': {
          margin: gutters(),
          maxWidth: 'none',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {' '}
      <Header
        title={title}
        subtitle={subtitle}
        toggleChat={toggleChat}
        showCloseButton={showCloseButton}
        titleAvatar={titleAvatar}
      />
      <Messages profileAvatar={profileAvatar} />
      <Sender
        ref={senderRef}
        sendMessage={handlerSendMsn}
        placeholder={senderPlaceHolder}
        disabledInput={disabledInput}
        autofocus={autofocus}
        buttonAlt={sendButtonAlt}
        onPressEmoji={togglePicker}
        menuButton={menuButton}
      />
      {footer && <Box>{footer}</Box>}
    </Box>
  );
}

export default Conversation;
