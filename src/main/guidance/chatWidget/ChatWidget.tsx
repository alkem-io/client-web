import React from 'react';
import { ChatBehaviorProvider } from './controls/context/ChatBehaviorContext';
import { MessagesProvider } from './controls/context/MessagesContext';
import { FullscreenPreviewProvider } from './controls/context/FullscreenPreviewContext';
import ChatWidgetInner from './ChatWidgetInner';

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
