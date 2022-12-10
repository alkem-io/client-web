import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import Icon from '../icon/Icon';
import { Caption } from '../typography/components';

interface MessageCounterProps {
  messageCount: number | undefined;
}

const MessageCounter = ({ messageCount }: PropsWithChildren<MessageCounterProps>) => {
  return (
    <Box display="flex" alignItems="center" gap={0.75} paddingX={0.5}>
      <Icon iconComponent={ForumOutlinedIcon} size="medium" />
      <Caption>{messageCount ?? ' '}</Caption>
    </Box>
  );
};

export default MessageCounter;
