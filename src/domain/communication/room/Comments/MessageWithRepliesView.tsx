import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { Box, ButtonBase, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CardText } from '@/core/ui/typography';
import MessageView, { MessageViewProps } from './MessageView';
import { gutters } from '@/core/ui/grid/utils';

const ChildMessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0),
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
            <ButtonBase onClick={() => setHasPressedReply(true)} aria-label={t('buttons.reply')}>
              <CardText>{t('buttons.reply')}</CardText>
            </ButtonBase>
          </li>
        )
      }
      {...props}
    >
      <ChildMessageContainer>
        {children}
        {isReplyFormVisible && <Box marginTop={gutters()}>{reply}</Box>}
      </ChildMessageContainer>
    </MessageView>
  );
};

export default MessageWithRepliesView;
