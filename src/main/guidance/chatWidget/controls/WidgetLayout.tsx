import { useEffect, useRef } from 'react';
import { ReactNode } from 'react';
import { gutters } from '@/core/ui/grid/utils';

import { useFullscreenPreview } from './context/FullscreenPreviewContext';
import { useChatBehavior } from './context/ChatBehaviorContext';

import Conversation from './components/Conversation/Conversation';
import Launcher from './components/Launcher/Launcher';
import FullScreenPreview from './components/FullScreenPreview/FullScreenPreview';

import { Box } from '@mui/material';

type Props = {
  title: string | ReactNode;
  titleAvatar?: string;
  subtitle: string;
  onSendMessage: (message: string) => void | Promise<void>;
  onToggleConversation: () => void;
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
  imagePreview?: boolean;
  zoomStep?: number;
  showBadge?: boolean;
  footer?: ReactNode;
  menuButton?: ReactNode;
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
  footer,
  menuButton,
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
    const previous = document.body.style.overflow;
    document.body.style.overflow = visible ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  const eventHandle = (evt: MouseEvent) => {
    if (evt.target && (evt.target as HTMLElement).className === 'rcw-message-img') {
      const { src, alt, naturalWidth, naturalHeight } = evt.target as HTMLImageElement;
      openPreview(src, alt, naturalWidth, naturalHeight);
    }
  };

  return (
    <Box
      sx={theme => ({
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        margin: '0 20px 20px 0',
        position: 'fixed',
        right: 0,
        zIndex: 9999,
        height: !showChat ? 'max-content' : undefined,
        width: !showChat ? 'max-content' : undefined,
        maxWidth: gutters(19),
        maxHeight: '-webkit-fill-available',
        scrollbarColor: `${theme.palette.primary.main} transparent`,
        '@media screen and (orientation: landscape)': {
          position: 'static',
          margin: 0,
          maxHeight: showChat ? `calc(100vh - ${gutters(2)(theme)})` : '-webkit-fill-available',
        },
        '@media screen and (orientation: portrait)': {
          maxWidth: 'none',
          position: showChat ? 'fixed' : 'static',
          margin: showChat ? undefined : 0,
        },
        ...(imagePreview && {
          cursor: 'pointer',
        }),
      })}
      className="chat-widget-container"
      id="rcw-chat-container"
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
          footer={footer}
          menuButton={menuButton}
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
