import type { ReactNode } from 'react';
import { useChatBehavior } from './context/ChatBehaviorContext';
import { useMessages } from './context/MessagesContext';

import WidgetLayout from './WidgetLayout';

type Props = {
  title: string | ReactNode;
  subtitle: string;
  senderPlaceHolder: string;
  profileAvatar?: string;
  showCloseButton: boolean;
  autofocus: boolean;
  handleNewUserMessage: (...args: any[]) => any;
  chatId: string;
  handleToggle?: (...args: any[]) => any;
  launcherOpenLabel: string;
  launcherCloseLabel: string;
  launcherOpenImg: string;
  launcherCloseImg: string;
  sendButtonAlt: string;
  imagePreview?: boolean;
  zoomStep?: number;
  handleSubmit?: (...args: any[]) => any;
  showBadge?: boolean;
  footer?: ReactNode;
  menuButton?: ReactNode;
};

function Widget({
  title,
  subtitle,
  senderPlaceHolder,
  profileAvatar,
  showCloseButton,
  autofocus,
  handleNewUserMessage,
  chatId,
  handleToggle,
  launcherOpenLabel,
  launcherCloseLabel,
  launcherCloseImg,
  launcherOpenImg,
  sendButtonAlt,
  imagePreview,
  zoomStep,
  handleSubmit,
  showBadge,
  footer,
  menuButton,
}: Props) {
  const { addUserMessage } = useMessages();
  const {
    toggleChat,
    state: { showChat },
  } = useChatBehavior();

  const toggleConversation = () => {
    toggleChat();
    handleToggle ? handleToggle(showChat) : null;
  };

  const handleMessageSubmit = (userInput: string) => {
    if (!userInput.trim()) {
      return;
    }

    handleSubmit?.(userInput);
    addUserMessage(userInput);
    handleNewUserMessage(userInput);
  };

  return (
    <WidgetLayout
      senderPlaceHolder={senderPlaceHolder}
      showCloseButton={showCloseButton}
      autofocus={autofocus}
      chatId={chatId}
      launcherOpenLabel={launcherOpenLabel}
      launcherCloseLabel={launcherCloseLabel}
      launcherOpenImg={launcherOpenImg}
      launcherCloseImg={launcherCloseImg}
      sendButtonAlt={sendButtonAlt}
      imagePreview={imagePreview}
      zoomStep={zoomStep}
      showBadge={showBadge}
      profileAvatar={profileAvatar}
      title={title}
      subtitle={subtitle}
      onSendMessage={handleMessageSubmit}
      onToggleConversation={toggleConversation}
      footer={footer}
      menuButton={menuButton}
    />
  );
}

export default Widget;
