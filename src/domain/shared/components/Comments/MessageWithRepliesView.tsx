import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { Box, ButtonBase, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CardText } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import MessageView, { MessageViewProps } from './MessageView';

const ChildMessageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderLeft: `${theme.spacing(0.3)} ${theme.palette.background.default} solid`,
  paddingLeft: theme.spacing(1),
  marginBottom: gutters()(theme),
  // '&:before': {
  //   content: '""',
  //   width: theme.spacing(0.3),
  //   marginRight: theme.spacing(1),
  //   backgroundColor: theme.palette.background.default,
  // },
}));

interface MessageWithRepliesViewProps extends MessageViewProps {
  reply?: ReactNode;
}

export const MessageWithRepliesView = ({
  reply,
  children,
  ...props
}: PropsWithChildren<MessageWithRepliesViewProps>) => {
  const { t } = useTranslation();

  const [hasPressedReply, setHasPressedReply] = useState(false);

  const isReplyFormVisible = hasPressedReply || React.Children.count(children) > 0;

  return (
    <MessageView
      actions={
        !isReplyFormVisible && (
          <ButtonBase component="li" onClick={() => setHasPressedReply(true)}>
            <CardText>{t('buttons.reply')}</CardText>
          </ButtonBase>
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
