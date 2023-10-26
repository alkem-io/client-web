import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon, IconButton, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { addResponseMessage, renderCustomComponent, Widget } from 'react-chat-widget';
import {
  useAskChatGuidanceQuestionQuery,
  useUpdateAnswerRelevanceMutation,
} from '../../../core/apollo/generated/apollo-hooks';
import logoSrc from '../../../domain/platform/Logo/Logo-Small.svg';
import { useTranslation } from 'react-i18next';
import { FEATURE_GUIDANCE_ENGINE } from '../../../domain/platform/config/features.constants';
import { useConfig } from '../../../domain/platform/config/useConfig';
import { useUserContext } from '../../../domain/community/user';
import 'react-chat-widget/lib/styles.css';
import { AuthorizationPrivilege } from '../../../core/apollo/generated/graphql-schema';
import formatChatGuidanceResponseAsMarkdown from './formatChatGuidanceResponseAsMarkdown';
import ChatWidgetStyles from './ChatWidgetStyles';
import ChatWidgetTitle from './ChatWidgetTitle';
import ChatWidgetSubtitle from './ChatWidgetSubtitle';
import ChatWidgetHelpDialog from './ChatWidgetHelpDialog';
import { createPortal } from 'react-dom';
import ChatWidgetFooter from './ChatWidgetFooter';
import { useMediaQuery } from '@mui/material';
import { useFullscreen } from '../../../core/ui/fullscreen/useFullscreen';

type Props = { answerId: string };

const Feedback = ({ answerId }: Props) => {
  const [voted, setVoted] = useState(false);
  const [update] = useUpdateAnswerRelevanceMutation();
  const updateHandler = async (answerId: string, relevant: boolean) => {
    await update({
      variables: {
        input: {
          id: answerId,
          relevant,
        }
      }
    });
    setVoted(true);
  };

  return (
    <Box display='flex' justifyContent='right' flexGrow='1'>
      <div>Is the answer relevant?</div>
      <Icon component={InfoIcon} />
      <IconButton color='success' disabled={voted} onClick={() => updateHandler(answerId, true)}>
        <ThumbUpOffAltIcon/>
      </IconButton>
      <IconButton color='error' disabled={voted} onClick={() => updateHandler(answerId, false)}>
        <ThumbDownOffAltIcon/>
      </IconButton>
    </Box>
  );
};

const ChatWidget = () => {
  const [newMessage, setNewMessage] = useState(null);
  const { t, i18n } = useTranslation();
  const { fullscreen } = useFullscreen();
  const { data, loading } = useAskChatGuidanceQuestionQuery({
    variables: { chatData: { question: newMessage!, language: i18n.language.toUpperCase() } },
    skip: !newMessage,
    fetchPolicy: 'network-only',
  });
  const { isFeatureEnabled } = useConfig();
  const guidanceEnabled: boolean = isFeatureEnabled(FEATURE_GUIDANCE_ENGINE);
  const { user: currentUser } = useUserContext();
  const enableWidget =
    !fullscreen && // Never show the widget when there's something in fullscreen
    currentUser?.hasPlatformPrivilege(AuthorizationPrivilege.AccessInteractiveGuidance) &&
    guidanceEnabled;

  useEffect(() => {
    if (data && !loading) {
      const responseMessageMarkdown = formatChatGuidanceResponseAsMarkdown(data.askChatGuidanceQuestion, t);
      addResponseMessage(responseMessageMarkdown);
      renderCustomComponent(Feedback, { answerId: data.askChatGuidanceQuestion.id });
    }
  }, [data, loading]);

  const handleNewUserMessage = message => {
    setNewMessage(message);
  };

  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const [chatToggleTime, setChatToggleTime] = useState(Date.now());

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [footerContainer, setFooterContainer] = useState<HTMLDivElement | null>(null);

  const getConversationContainer = () => {
    const conversationContainer = wrapperRef.current?.querySelector('.rcw-conversation-container');
    if (!conversationContainer) {
      setFooterContainer(null);
      return;
    }
    let footerContainer = conversationContainer.querySelector('.footer-container') as HTMLDivElement | null;
    if (!footerContainer) {
      footerContainer = document.createElement('div');
      footerContainer.classList.add('footer-container');
      conversationContainer.appendChild(footerContainer);
    }
    setFooterContainer(footerContainer);
  };

  useLayoutEffect(getConversationContainer, [chatToggleTime]);

  const isMobile = useMediaQuery('(orientation: portrait)');

  return enableWidget ? (
    <>
      <ChatWidgetStyles ref={wrapperRef}>
        <Widget
          profileAvatar={logoSrc}
          title={<ChatWidgetTitle mobile={isMobile} onClickInfo={() => setIsHelpDialogOpen(true)} />}
          subtitle={<ChatWidgetSubtitle />}
          handleNewUserMessage={handleNewUserMessage}
          handleToggle={() => setChatToggleTime(Date.now())}

        />
      </ChatWidgetStyles>
      <ChatWidgetHelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
      {footerContainer && createPortal(<ChatWidgetFooter />, footerContainer)}
    </>
  ) : null;
};

export default ChatWidget;
