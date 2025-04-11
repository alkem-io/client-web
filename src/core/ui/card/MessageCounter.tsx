import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import Icon from '../icon/Icon';
import { Caption } from '@/core/ui/typography';

const MessageCounter = ({ commentsCount }: PropsWithChildren<{ commentsCount: number | undefined }>) => (
  <Box display="flex" alignItems="center" gap={0.75} paddingX={0.5}>
    <Icon iconComponent={ForumOutlinedIcon} size="medium" />
    <Caption>{commentsCount ?? ' '}</Caption>
  </Box>
);

export default MessageCounter;
