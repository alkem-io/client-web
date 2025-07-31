import { useRef, useState } from 'react';
import { ReactNode } from 'react';

import Header from './components/Header';
import Messages from './components/Messages';
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
        minWidth: 370,
        maxWidth: '90vw',
        position: 'relative',
        opacity: showChat ? 1 : 0,
        zIndex: showChat ? 'auto' : -1,
        pointerEvents: showChat ? 'auto' : 'none',
        transform: showChat ? 'translateY(0px)' : 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        boxShadow: theme => `0px 2px 10px 1px ${theme.palette.grey[300]}`,
        '@media (max-width:800px)': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
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
      <Messages />
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
