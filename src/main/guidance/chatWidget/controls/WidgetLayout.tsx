import { useEffect, useRef } from 'react';
import { ReactNode } from 'react';
import { gutters } from '@/core/ui/grid/utils';

import { useFullscreenPreview } from './context/FullscreenPreviewContext';
import { useChatBehavior } from './context/ChatBehaviorContext';

import Conversation from './components/Conversation';
import Launcher from './components/Launcher';
import FullScreenPreview from './components/FullScreenPreview';

import { Box } from '@mui/material';

type Props = {
  title: string | ReactNode;
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
          '.rcw-widget-container': {
            position: 'static',
            margin: 0,
            '&:has(.active)': {
              maxHeight: `calc(100vh - ${gutters(2)(theme)})`,
            },
          },
        },
        '@media screen and (orientation: portrait)': {
          maxWidth: 'none',
          '&:not(:has(.active))': {
            position: 'static',
            margin: 0,
          },
        },
        '@media (max-width:800px)': {
          height: '100vh',
          margin: 0,
          maxWidth: 'none',
          width: '100%',
        },
        ...(imagePreview && {
          cursor: 'pointer',
        }),
      })}
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
