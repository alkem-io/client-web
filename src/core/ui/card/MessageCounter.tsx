import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { Box } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { Caption } from '@/core/ui/typography';
import Icon, { type IconProps } from '../icon/Icon';

interface MessageCounterProps
  extends PropsWithChildren<{
    commentsCount: number | undefined;
    size?: IconProps['size'];
  }> {}

const MessageCounter = ({ commentsCount, size = 'medium' }: MessageCounterProps) => (
  <Box display="flex" alignItems="center" gap={0.75} paddingX={0.5}>
    <Icon iconComponent={ForumOutlinedIcon} color="primary" size={size} />
    <Caption color="textPrimary">{commentsCount ?? ' '}</Caption>
  </Box>
);

export default MessageCounter;
