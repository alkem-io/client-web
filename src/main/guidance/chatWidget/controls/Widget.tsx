import { FullscreenPreviewProvider } from './context/FullscreenPreviewContext';
import { MessagesProvider, useMessages } from './context/MessagesContext';
import { ChatBehaviorProvider, useChatBehavior } from './context/ChatBehaviorContext';

import WidgetLayout from './layout';

type Props = {
  title: string;
  subtitle: string;
  senderPlaceHolder: string;
  profileAvatar?: string;
  showCloseButton: boolean;
  autofocus: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleNewUserMessage: (...args: any[]) => any;
  chatId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleToggle?: (...args: any[]) => any;
  launcherOpenLabel: string;
  launcherCloseLabel: string;
  launcherOpenImg: string;
  launcherCloseImg: string;
  sendButtonAlt: string;
  showTimeStamp: boolean;
  imagePreview?: boolean;
  zoomStep?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleSubmit?: (...args: any[]) => any;
  showBadge?: boolean;
};

function WidgetWithContext({
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
  showTimeStamp,
  imagePreview,
  zoomStep,
  handleSubmit,
  showBadge,
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

  const handleMessageSubmit = userInput => {
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
      showTimeStamp={showTimeStamp}
      imagePreview={imagePreview}
      zoomStep={zoomStep}
      showBadge={showBadge}
      profileAvatar={profileAvatar}
      title={title}
      subtitle={subtitle}
      onSendMessage={handleMessageSubmit}
      onToggleConversation={toggleConversation}
    />
  );
}

function Widget(props: Props) {
  return (
    <ChatBehaviorProvider>
      <MessagesProvider>
        <FullscreenPreviewProvider>
          <WidgetWithContext {...props} />
        </FullscreenPreviewProvider>
      </MessagesProvider>
    </ChatBehaviorProvider>
  );
}

export default Widget;
