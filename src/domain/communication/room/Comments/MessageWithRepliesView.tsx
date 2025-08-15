import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { Box, ButtonBase, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CardText } from '@/core/ui/typography';
import MessageView, { MessageViewProps } from './MessageView';

const ChildMessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderLeft: `${theme.spacing(0.3)} ${theme.palette.background.default} solid`,
  paddingLeft: theme.spacing(1),
}));

interface MessageWithRepliesViewProps extends MessageViewProps {
  reply?: ReactNode;
  canReply?: boolean;
}

export const MessageWithRepliesView = ({
  reply,
  canReply = true,
  children,
  ...props
}: PropsWithChildren<MessageWithRepliesViewProps>) => {
  const { t } = useTranslation();

  const [hasPressedReply, setHasPressedReply] = useState(false);

  const isReplyFormVisible = hasPressedReply || React.Children.count(children) > 0;

  return (
    <MessageView
      actions={
        !isReplyFormVisible &&
        canReply && (
          <li>
            <ButtonBase onClick={() => setHasPressedReply(true)}>
              <CardText>{t('buttons.reply')}</CardText>
            </ButtonBase>
          </li>
        )
      }
      {...props}
    >
      <ChildMessageContainer>
        {children}
        {isReplyFormVisible && reply}
      </ChildMessageContainer>
    </MessageView>
  );
};

export default MessageWithRepliesView;
