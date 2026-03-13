import ChatWidgetInner from './ChatWidgetInner';
import { ChatBehaviorProvider } from './controls/context/ChatBehaviorContext';
import { FullscreenPreviewProvider } from './controls/context/FullscreenPreviewContext';
import { MessagesProvider } from './controls/context/MessagesContext';

const ChatWidget = () => {
  return (
    <ChatBehaviorProvider>
      <MessagesProvider>
        <FullscreenPreviewProvider>
          <ChatWidgetInner />
        </FullscreenPreviewProvider>
      </MessagesProvider>
    </ChatBehaviorProvider>
  );
};

export default ChatWidget;
