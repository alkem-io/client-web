import { useEffect, useRef } from 'react';

import { useFullscreenPreview } from './context/FullscreenPreviewContext';
import { useChatBehavior } from './context/ChatBehaviorContext';

import Conversation from './components/Conversation';
import Launcher from './components/Launcher';
import FullScreenPreview from './components/FullScreenPreview';

import { Box } from '@mui/material';

type Props = {
  title: string;
  titleAvatar?: string;
  subtitle: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSendMessage: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onToggleConversation: (...args: any[]) => any;
  senderPlaceHolder: string;
  profileAvatar?: string;
  showCloseButton: boolean;
  autofocus: boolean;
  chatId: string;
  launcherOpenLabel: string;
  launcherCloseLabel: string;
  launcherCloseImg: string;
  launcherOpenImg: string;
  sendButtonAlt: string;
  showTimeStamp: boolean;
  imagePreview?: boolean;
  zoomStep?: number;
  showBadge?: boolean;
};

function WidgetLayout({
  title,
  subtitle,
  onSendMessage,
  onToggleConversation,
  senderPlaceHolder,
  profileAvatar,
  showCloseButton,
  autofocus,
  chatId,
  launcherOpenLabel,
  launcherCloseLabel,
  launcherCloseImg,
  launcherOpenImg,
  sendButtonAlt,
  imagePreview,
  zoomStep,
  showBadge,
  titleAvatar,
}: Props) {
  const {
    state: { disabledInput, showChat },
  } = useChatBehavior();

  const { state: previewState, openPreview } = useFullscreenPreview();
  const { visible } = previewState;

  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showChat) {
      messageRef.current = document.getElementById('messages') as HTMLDivElement;
    }
    return () => {
      messageRef.current = null;
    };
  }, [showChat]);

  const eventHandle = evt => {
    if (evt.target && evt.target.className === 'rcw-message-img') {
      const { src, alt, naturalWidth, naturalHeight } = evt.target as HTMLImageElement;
      openPreview(src, alt, naturalWidth, naturalHeight);
    }
  };

  /**
   * Previewer needs to prevent body scroll behavior when fullScreenMode is true
   */
  useEffect(() => {
    const target = messageRef?.current;
    if (imagePreview && showChat) {
      target?.addEventListener('click', eventHandle, false);
    }

    return () => {
      target?.removeEventListener('click', eventHandle);
    };
  }, [imagePreview, showChat]);

  useEffect(() => {
    document.body.setAttribute('style', `overflow: ${visible ? 'hidden' : 'auto'}`);
  }, [visible]);

  return (
    <Box
      sx={{
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        margin: '0 20px 20px 0',
        position: 'fixed',
        right: 0,
        zIndex: 9999,
        // If !showChat, apply rcw-close-widget-container styles
        height: !showChat ? 'max-content' : undefined,
        width: !showChat ? 'max-content' : undefined,
        // Responsive override for small screens (as in media query)
        '@media (max-width:800px)': {
          height: '100%', // applies for mobile view
          // ...put widget-container-fs mixin styles here if needed
        },
        // Optionally, add other dynamic styles (e.g., for .rcw-previewer)
        // If there are special styles for 'rcw-previewer', add them here conditionally:
        ...(imagePreview &&
          {
            // stylings for active preview mode,
            // For example: pointer for images inside the widget. Leave this to nested elements if needed.
          }),
      }}
    >
      {showChat && (
        <Conversation
          title={title}
          subtitle={subtitle}
          sendMessage={onSendMessage}
          senderPlaceHolder={senderPlaceHolder}
          profileAvatar={profileAvatar}
          toggleChat={onToggleConversation}
          showCloseButton={showCloseButton}
          disabledInput={disabledInput}
          autofocus={autofocus}
          titleAvatar={titleAvatar}
          showChat={showChat}
          sendButtonAlt={sendButtonAlt}
        />
      )}
      <Launcher
        toggle={onToggleConversation}
        chatId={chatId}
        openLabel={launcherOpenLabel}
        closeLabel={launcherCloseLabel}
        closeImg={launcherCloseImg}
        openImg={launcherOpenImg}
        showBadge={showBadge}
      />
      {imagePreview && <FullScreenPreview zoomStep={zoomStep} />}
    </Box>
  );
}

export default WidgetLayout;
