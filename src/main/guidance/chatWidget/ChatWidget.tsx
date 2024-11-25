import { cloneElement, ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, IconButton, IconButtonProps, Paper, SvgIconProps, Theme, Tooltip } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { addResponseMessage, dropMessages, renderCustomComponent, toggleWidget, Widget } from 'react-chat-widget';
import {
  useAskChatGuidanceQuestionQuery,
  useResetChatGuidanceMutation,
  useUpdateAnswerRelevanceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import logoSrc from '@/main/ui/logo/logoSmall.svg';
import { useTranslation } from 'react-i18next';
import 'react-chat-widget/lib/styles.css';
import formatChatGuidanceResponseAsMarkdown from './formatChatGuidanceResponseAsMarkdown';
import ChatWidgetStyles from './ChatWidgetStyles';
import ChatWidgetTitle from './ChatWidgetTitle';
import ChatWidgetHelpDialog from './ChatWidgetHelpDialog';
import { createPortal } from 'react-dom';
import ChatWidgetFooter from './ChatWidgetFooter';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { InfoOutlined } from '@mui/icons-material';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from '@/main/ui/platformNavigation/constants';
import ChatWidgetMenu from './ChatWidgetMenu';

type FeedbackType = 'positive' | 'negative';

interface FeedbackButtonProps {
  type: FeedbackType;
  selectedType?: FeedbackType;
  onSelect?: (type: FeedbackType) => void;
  children: ReactElement<SvgIconProps>;
}

const ButtonColor: Record<FeedbackType, (theme: Theme) => string> = {
  positive: theme => theme.palette.primary.main,
  negative: theme => theme.palette.negative.main,
};

const FeedbackButton = ({
  type,
  selectedType,
  onSelect,
  children,
  ...props
}: Omit<IconButtonProps, 'type' | 'onSelect'> & FeedbackButtonProps) => {
  const getSelectedStyle = () => {
    if (!selectedType) {
      return {
        fontSize: gutters(),
      };
    }
    const isSelected = selectedType === type;
    return {
      fontSize: gutters(isSelected ? 1.2 : 0.75),
      padding: isSelected ? 0.3 : 0.75,
    };
  };

  return (
    <IconButton
      size="small"
      sx={{
        color: theme => theme.palette.background.paper,
        '&, &:hover': {
          backgroundColor: ButtonColor[type],
        },
        ...getSelectedStyle(),
      }}
      onClick={() => onSelect?.(type)}
      {...props}
    >
      {cloneElement(children, { fontSize: 'inherit' })}
    </IconButton>
  );
};

interface FeedbackProps {
  answerId: string;
}

const Feedback = ({ answerId }: FeedbackProps) => {
  const [updateAnswerRelevance, { loading }] = useUpdateAnswerRelevanceMutation();

  const [lastFeedbackType, setLastFeedbackType] = useState<FeedbackType | undefined>(undefined);

  const updateHandler = async (feedbackType: FeedbackType) => {
    if (feedbackType === lastFeedbackType) {
      return;
    }
    setLastFeedbackType(feedbackType);
    try {
      await updateAnswerRelevance({
        variables: {
          input: {
            id: answerId,
            relevant: feedbackType === 'positive',
          },
        },
      });
    } catch (error) {
      setLastFeedbackType(lastFeedbackType);
    }
  };

  const { t } = useTranslation();

  return (
    <Gutters
      row
      gap={gutters(0.5)}
      disablePadding
      marginTop={gutters(-1)}
      justifyContent="right"
      alignItems="center"
      flexGrow={1}
    >
      <Tooltip
        title={<Caption>{t('chatbot.feedback.tooltip')}</Caption>}
        PopperProps={{ sx: { zIndex: PLATFORM_NAVIGATION_MENU_Z_INDEX + 1 } }}
      >
        <Box
          component={Paper}
          elevation={0}
          sx={{ backgroundColor: theme => theme.palette.divider }}
          display="flex"
          gap={gutters(0.5)}
          paddingX={gutters(0.5)}
          paddingY={gutters(0.25)}
        >
          <Caption>{t('chatbot.feedback.message')}</Caption>
          <InfoOutlined fontSize="small" />
        </Box>
      </Tooltip>
      <FeedbackButton type="positive" disabled={loading} selectedType={lastFeedbackType} onSelect={updateHandler}>
        <ThumbUpOffAltIcon />
      </FeedbackButton>
      <FeedbackButton type="negative" disabled={loading} selectedType={lastFeedbackType} onSelect={updateHandler}>
        <ThumbDownOffAltIcon />
      </FeedbackButton>
    </Gutters>
  );
};

export const useInitialChatWidgetMessage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    addResponseMessage(t('chatbot.intro'));
  }, []);
};

const ChatWidget = () => {
  const [newMessage, setNewMessage] = useState(null);
  const { t, i18n } = useTranslation();
  const { data, loading } = useAskChatGuidanceQuestionQuery({
    variables: { chatData: { question: newMessage!, language: i18n.language.toUpperCase() } },
    skip: !newMessage,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data && !loading) {
      const responseMessageMarkdown = formatChatGuidanceResponseAsMarkdown(data.askChatGuidanceQuestion, t);
      addResponseMessage(responseMessageMarkdown, data.askChatGuidanceQuestion.id!);
      renderCustomComponent(Feedback, { answerId: data.askChatGuidanceQuestion.id });
    }
  }, [data, loading]);

  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const [chatToggleTime, setChatToggleTime] = useState(Date.now());

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [footerContainer, setFooterContainer] = useState<HTMLDivElement | null>(null);

  const setupFooterContainer = () => {
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

  useLayoutEffect(setupFooterContainer, [chatToggleTime]);

  const [menuButtonContainer, setMenuButtonContainer] = useState<HTMLDivElement | null>(null);

  const setupMenuButton = () => {
    const messageInputContainer = wrapperRef.current?.querySelector('.rcw-sender');
    if (!messageInputContainer) {
      setMenuButtonContainer(null);
      return;
    }
    let menuButtonContainer = messageInputContainer.querySelector('.menu-button-container') as HTMLDivElement | null;
    if (!menuButtonContainer) {
      menuButtonContainer = document.createElement('div');
      menuButtonContainer.classList.add('menu-button-container');
      messageInputContainer.appendChild(menuButtonContainer);
    }
    setMenuButtonContainer(menuButtonContainer);
  };

  useLayoutEffect(setupMenuButton, [chatToggleTime]);

  const [resetChatGuidance] = useResetChatGuidanceMutation();

  const handleClearChat = () => {
    resetChatGuidance();
    dropMessages();
    addResponseMessage(t('chatbot.intro'));
  };

  return (
    <>
      <ChatWidgetStyles ref={wrapperRef} aria-label={t('common.help')}>
        <Widget
          profileAvatar={logoSrc}
          title={<ChatWidgetTitle onClickInfo={() => setIsHelpDialogOpen(true)} />}
          subtitle={<></>}
          handleNewUserMessage={setNewMessage}
          handleToggle={() => setChatToggleTime(Date.now())}
        />
      </ChatWidgetStyles>
      <ChatWidgetHelpDialog open={isHelpDialogOpen} onClose={() => setIsHelpDialogOpen(false)} />
      {footerContainer && createPortal(<ChatWidgetFooter />, footerContainer)}
      {menuButtonContainer &&
        createPortal(<ChatWidgetMenu onClear={handleClearChat} onClose={toggleWidget} />, menuButtonContainer)}
    </>
  );
};

export default ChatWidget;
